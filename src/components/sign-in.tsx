"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-800" />;
  }

  // Signed in — show the user and a sign-out button.
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-300 sm:inline">
          {session.user.name ?? session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Signed out — button opens the modal.
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Sign in
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-100"
            >
              ✕
            </button>

            <h2 id="signin-title" className="text-xl font-bold text-slate-100">
              Sign in to BookingHub
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Book tickets and track your orders.
            </p>

            <button
              onClick={() => signIn("okta", { redirectTo: "/" })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Continue with Okta
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              You&apos;ll be redirected to Okta to sign in securely.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
