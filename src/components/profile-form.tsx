"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveProfile, ProfileFormState } from "@/app/profile/actions";
import { City, UserProfile } from "@/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // keep in sync with AVATAR_MAX_BYTES in lib/s3.ts

interface ProfileFormProps {
  profile: UserProfile;
  cities: City[];
  /** Signed S3 URL for displaying profile.avatarUrl (the bucket may be private). */
  avatarDisplayUrl: string | null;
  /** Auth0 picture, shown until the user uploads their own. */
  fallbackImage: string | null;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

/** Asks our API for a presigned URL, then PUTs the file straight to S3. */
async function uploadAvatar(file: File): Promise<string> {
  const res = await fetch("/api/profile/avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Couldn't start the upload");
  }

  const upload = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) {
    throw new Error("Upload to storage failed");
  }

  return data.fileUrl as string;
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 disabled:opacity-60";

export default function ProfileForm({
  profile,
  cities,
  avatarDisplayUrl,
  fallbackImage,
}: ProfileFormProps) {
  const [state, formAction, isSaving] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    { status: "idle" },
  );
  // avatarUrl is what gets saved; displayUrl is what the <img> loads.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [displayUrl, setDisplayUrl] = useState<string | null>(avatarDisplayUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Release the local object URL when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUpload({ status: "error", message: "Choose a JPEG, PNG or WebP image." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setUpload({ status: "error", message: "Image must be 5 MB or smaller." });
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUpload({ status: "uploading" });
    try {
      setAvatarUrl(await uploadAvatar(file));
      setDisplayUrl(null); // the local preview now stands in for the new image
      setUpload({ status: "idle" });
    } catch (err) {
      setPreview(null);
      setUpload({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  function handleRemove() {
    setPreview(null);
    setAvatarUrl(null);
    setDisplayUrl(null);
    setUpload({ status: "idle" });
  }

  const isUploading = upload.status === "uploading";
  const shownImage = preview ?? displayUrl ?? fallbackImage;
  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-slate-800">
          {shownImage ? (
            // Plain <img>: sources span S3, Auth0/Gravatar and local blob: previews.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownImage}
              alt="Profile picture"
              // e.g. the S3 object was deleted or the signed URL expired
              onError={() => setDisplayUrl(null)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-300">
              {initials || "?"}
            </span>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-slate-200">
              Uploading…
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition hover:text-slate-200 disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">JPEG, PNG or WebP, up to 5 MB.</p>
          {upload.status === "error" && (
            <p className="text-xs text-red-400">{upload.message}</p>
          )}
          {state.fieldErrors?.avatarUrl && (
            <p className="text-xs text-red-400">{state.fieldErrors.avatarUrl}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">
            Full name
          </label>
          <input id="name" name="name" defaultValue={profile.name} required maxLength={100} className={inputClass} />
          {state.fieldErrors?.name && <p className="text-xs text-red-400">{state.fieldErrors.name}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Email
          </label>
          <input id="email" value={profile.email} disabled className={inputClass} />
          <p className="text-xs text-slate-500">Managed by your sign-in provider.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-slate-300">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
          {state.fieldErrors?.phone && <p className="text-xs text-red-400">{state.fieldErrors.phone}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="cityId" className="text-sm font-medium text-slate-300">
            Preferred city
          </label>
          <select id="cityId" name="cityId" defaultValue={profile.cityId} className={inputClass}>
            <option value="">Not set</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.cityId && <p className="text-xs text-red-400">{state.fieldErrors.cityId}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-slate-800 pt-5">
        {state.message && (
          <p
            role="status"
            className={`text-sm ${state.status === "success" ? "text-emerald-400" : "text-red-400"}`}
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
