"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cities } from "@/data/cities";
import { updateProfile } from "@/lib/api";
import { isOwnAvatarUrl } from "@/lib/s3";

export interface ProfileFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "cityId" | "avatarUrl", string>>;
}

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !session.accessToken) {
    return { status: "error", message: "Your session has expired. Please sign in again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const cityId = String(formData.get("cityId") ?? "");
  const avatarUrl = String(formData.get("avatarUrl") ?? "") || null;

  const fieldErrors: ProfileFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Name is required";
  else if (name.length > 100) fieldErrors.name = "Name must be 100 characters or fewer";
  if (phone && !PHONE_PATTERN.test(phone)) fieldErrors.phone = "Enter a valid phone number";
  if (cityId && !cities.some((c) => c.id === cityId)) fieldErrors.cityId = "Pick a city from the list";
  if (avatarUrl && !isOwnAvatarUrl(userId, avatarUrl)) fieldErrors.avatarUrl = "Invalid profile image";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await updateProfile(
      { name, email: session.user?.email ?? "", phone, cityId, avatarUrl },
      session.accessToken,
    );
  } catch (err) {
    console.error("Failed to update profile", err);
    return { status: "error", message: "Couldn't save your profile. Please try again." };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Profile saved." };
}
