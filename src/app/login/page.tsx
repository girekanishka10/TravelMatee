"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState, useEffect } from "react";
import { useApp } from "@/lib/store";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "guide" ? "guide" : "traveler";
  const [role, setRole] = useState<"traveler" | "guide">(initialRole);

  const { login, loginAsGuide } = useApp();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setIdentifier("");
    setPassword("");
    setError(null);
  }, [role]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (role === "guide") {
      const err = loginAsGuide(identifier, password);
      if (err) {
        setError(err);
        return;
      }
      router.push("/app/guide-dashboard");
    } else {
      const err = login(identifier, password);
      if (err) {
        setError(err);
        return;
      }
      router.push("/app");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="text-xs text-muted hover:text-ink mb-6 inline-flex items-center gap-1">
        ← Back to home
      </Link>

      <div className="flex border-b border-line mb-6">
        <button
          type="button"
          onClick={() => setRole("traveler")}
          className={`pb-3 text-sm font-medium border-b-2 mr-6 transition-colors ${
            role === "traveler"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Traveler Login
        </button>
        <button
          type="button"
          onClick={() => setRole("guide")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            role === "guide"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Guide Login
        </button>
      </div>

      <h1 className="font-serif text-3xl font-bold text-ink">
        {role === "guide" ? "Guide Sign In" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {role === "guide"
          ? "Access your guide dashboard, incoming trip inquiries, and client chats."
          : "Sign in to explore compatible travel groups and plan your trips."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted">
            {role === "guide" ? "Guide Email / Mobile" : "Email / Mobile"}
          </label>
          <input
            className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted">
            Password
          </label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md">{error}</p>}

        <button
          type="submit"
          className="btn-primary w-full rounded-lg py-2.5 text-sm"
        >
          {role === "guide" ? "Sign in to Guide Dashboard" : "Log in"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-xs text-muted">
        <Link href="/forgot" className="hover:underline">
          Forgot password?
        </Link>
        <Link
          href={role === "guide" ? "/signup?role=guide" : "/signup"}
          className="text-ink font-medium hover:underline"
        >
          {role === "guide" ? "Register as Guide" : "Create Traveler Account"}
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-card/60 p-4 text-xs">
        <p className="font-semibold text-ink mb-2">Test Profiles (Password: demo123)</p>
        {role === "traveler" ? (
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Kanishka Gire", email: "kanishka@travelmate.app" },
              { name: "Dr Sachin Sakhare", email: "sachin@travelmate.app" },
              { name: "Janhavi Patil", email: "janhavi@travelmate.app" },
              { name: "Gouri Maher", email: "gouri@travelmate.app" },
            ].map((t) => (
              <button
                key={t.email}
                type="button"
                onClick={() => {
                  setIdentifier(t.email);
                  setPassword("demo123");
                }}
                className="rounded-md border border-line bg-card px-2.5 py-1 text-[11px] text-ink hover:border-forest/50 hover:bg-sand/30 transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Dr Sachin Sakhare", email: "guide.sachin@travelmate.app" },
              { name: "Swarupa Deshpande", email: "guide.swarupa@travelmate.app" },
              { name: "Anjali Bhajane", email: "guide.anjali@travelmate.app" },
            ].map((g) => (
              <button
                key={g.email}
                type="button"
                onClick={() => {
                  setIdentifier(g.email);
                  setPassword("demo123");
                }}
                className="rounded-md border border-line bg-card px-2.5 py-1 text-[11px] text-ink hover:border-forest/50 hover:bg-sand/30 transition-colors"
              >
                {g.name} (Guide)
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-line bg-card/60 p-4 text-xs text-muted">
        <p className="font-semibold text-ink mb-1">New to TravelMate?</p>
        <p>
          {role === "guide"
            ? "Register a verified guide profile to offer regional tours, list rates, and receive booking requests."
            : "Create your traveler account to discover companions, take the compatibility test, and join trips."}
        </p>
        <Link
          href={role === "guide" ? "/signup?role=guide" : "/signup"}
          className="mt-2.5 inline-block text-xs font-semibold text-forest hover:underline"
        >
          {role === "guide" ? "Register as Guide →" : "Create Traveler Account →"}
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
