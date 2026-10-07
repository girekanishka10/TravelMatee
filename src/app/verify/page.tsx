"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";

const DEMO_OTP = "123456";

export default function VerifyPage() {
  const { currentUser, verifyCurrentUser } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp" | "done">("details");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demoId, setDemoId] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (currentUser?.verificationStatus === "verified" && step !== "done") {
      router.replace(currentUser.compatibilityAnswers ? "/app" : "/quiz");
    }
  }, [currentUser, step, router]);

  if (!currentUser) {
    return (
      <main className="p-8">
        Please <a href="/login">log in</a> first.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">Prototype only</p>
      <h1 className="mt-2 font-serif text-4xl">Demo Identity Verification</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Do not enter real government ID numbers. This flow is labelled as a demo and never stores Aadhaar or
        Aadhaar-linked OTPs. A verification badge can appear on your profile; sensitive details stay private.
      </p>

      {step === "details" && (
        <div className="mt-8 space-y-4">
          <label className="block text-sm">
            Full name (as on a travel document)
            <input defaultValue={currentUser.name} className="mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3" />
          </label>
          <label className="block text-sm">
            Demo ID token (any 4 characters)
            <input
              value={demoId}
              onChange={(e) => setDemoId(e.target.value.slice(0, 4))}
              placeholder="e.g. 4821"
              className="mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3"
            />
          </label>
          <button
            disabled={demoId.length < 4}
            onClick={() => {
              setSent(true);
              setStep("otp");
            }}
            className="btn-primary w-full rounded-xl py-3 font-semibold disabled:opacity-40"
          >
            Send OTP
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="mt-8 space-y-4">
          {sent && (
            <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
              Demo OTP sent. Use <strong>{DEMO_OTP}</strong>.
            </p>
          )}
          <label className="block text-sm">
            Enter OTP
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3 tracking-[0.4em]"
              inputMode="numeric"
            />
          </label>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            onClick={() => {
              if (otp !== DEMO_OTP) {
                setError("Incorrect demo OTP.");
                return;
              }
              verifyCurrentUser();
              setStep("done");
            }}
            className="btn-primary w-full rounded-xl py-3 font-semibold"
          >
            Verify
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="mt-10 rounded-[1.6rem] bg-card p-8 text-center tm-shadow">
          <p className="text-5xl">✓</p>
          <h2 className="mt-3 font-serif text-3xl">Identity Verified</h2>
          <p className="mt-2 text-sm text-muted">Your public profile will only show a verification badge.</p>
          <button
            onClick={() => router.push(currentUser.compatibilityAnswers ? "/app" : "/quiz")}
            className="btn-primary mt-6 w-full rounded-xl py-3 font-semibold"
          >
            Continue
          </button>
        </div>
      )}
    </main>
  );
}
