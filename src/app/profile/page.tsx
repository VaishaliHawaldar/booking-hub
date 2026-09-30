import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfileForm from "@/components/profile-form";
import { getCities, getProfile } from "@/lib/api";
import { AvatarImage, getAvatarForUrl, getLatestAvatar } from "@/lib/s3";
import { UserProfile } from "@/types";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user || !session.accessToken) {
    redirect("/");
  }

  const [cities, saved] = await Promise.all([
    getCities(),
    getProfile(session.accessToken).catch(() => null),
  ]);

  // Resolve the profile picture from S3. If the API has a saved profile, trust
  // its avatarUrl (null means the user removed it); otherwise fall back to the
  // latest image the user uploaded.
  const userId = session.user.id!;
  let avatar: AvatarImage | null = null;
  try {
    if (saved) {
      avatar = saved.avatarUrl ? await getAvatarForUrl(userId, saved.avatarUrl) : null;
    } else {
      avatar = await getLatestAvatar(userId);
    }
  } catch (err) {
    console.error("Failed to load profile image from S3", err);
  }

  // First visit (no profile stored yet) — prefill from the Auth0 identity.
  const profile: UserProfile = {
    ...(saved ?? {
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      phone: "",
      cityId: "",
    }),
    avatarUrl: avatar?.fileUrl ?? null,
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
        ← Back to movies
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Your profile</h1>
      <p className="mt-1 text-sm text-slate-400">
        Manage your personal details and profile picture.
      </p>

      <ProfileForm
        profile={profile}
        cities={cities}
        avatarDisplayUrl={avatar?.displayUrl ?? null}
        fallbackImage={session.user.image ?? null}
      />
    </main>
  );
}
