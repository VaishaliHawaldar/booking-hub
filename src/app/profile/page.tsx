import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfileForm from "@/components/profile-form";
import { getCities, getProfile } from "@/lib/api";
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

  // First visit (no profile stored yet) — prefill from the Auth0 identity.
  const profile: UserProfile = saved ?? {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    phone: "",
    cityId: "",
    avatarUrl: null,
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
        fallbackImage={session.user.image ?? null}
      />
    </main>
  );
}
