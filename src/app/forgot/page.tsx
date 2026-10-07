"use client";

import Link from "next/link";

export default function ForgotPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <h1 className="font-serif text-4xl">Reset password</h1>
      <p className="mt-3 text-muted">
        Password recovery is not enabled in prototype mode. Please sign in with your registered account credentials or create a new account.
      </p>
      <Link href="/login" className="btn-primary mt-6 rounded-xl px-5 py-3 text-center font-semibold">
        Back to login
      </Link>
    </main>
  );
}
