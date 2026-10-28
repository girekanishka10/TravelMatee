"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { VerificationBadge } from "@/components/Ui";

export default function VerifyPage() {
  const { currentUser, submitVerificationRequest } = useApp();
  const router = useRouter();
  const [method, setMethod] = useState("digilocker");
  const [legalName, setLegalName] = useState(currentUser?.name || "");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-md p-8 text-center text-sm text-muted">
        Please <Link href="/login" className="text-forest underline font-semibold">log in</Link> first.
      </main>
    );
  }

  const status = currentUser.verificationStatus || "unverified";

  function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setNotice("Please accept the verification terms and data privacy consent.");
      return;
    }
    const res = submitVerificationRequest();
    setNotice(res.message);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link href="/app/profile" className="text-xs text-muted hover:text-ink mb-6 inline-flex items-center gap-1">
        ← Back to Profile
      </Link>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-muted font-medium">Identity Verification</p>
        <VerificationBadge status={status} />
      </div>

      <h1 className="mt-2 font-serif text-3xl font-bold text-ink">Traveler Verification</h1>
      <p className="mt-2 text-xs text-muted leading-relaxed">
        Zovira ensures traveler safety by verifying travel companions. To safeguard personal data privacy, we do not store sensitive government identity numbers or raw document copies on this platform.
      </p>

      {/* Current Status Box */}
      <div className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-ink">Current Status</h2>
        <div className="mt-2 flex items-center gap-2">
          <VerificationBadge status={status} />
          <span className="text-xs text-muted capitalize">
            {status === "verified"
              ? "Your profile is verified."
              : status === "pending"
              ? "Verification request is currently pending official integration."
              : status === "rejected"
              ? "Verification was rejected."
              : "No verification request submitted yet."}
          </span>
        </div>

        {status === "pending" && (
          <div className="mt-4 rounded-lg bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold">⏳ Verification Request Pending</p>
            <p className="mt-1 text-[11px]">
              Your verification request has been queued. Because no external government identity provider is currently integrated into this demo environment, your verification status will remain <strong>Pending</strong>. Users are never automatically marked verified without a genuine verification provider.
            </p>
          </div>
        )}

        {status === "verified" && (
          <div className="mt-4 rounded-lg bg-forest/10 border border-forest/20 p-3.5 text-xs text-forest leading-relaxed">
            <p className="font-semibold">✓ Verified Traveler</p>
            <p className="mt-1 text-[11px]">
              Your identity has been verified through a genuine verification process. Your public profile displays the verified badge.
            </p>
          </div>
        )}

        {status === "rejected" && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 leading-relaxed">
            <p className="font-semibold">✕ Verification Rejected</p>
            <p className="mt-1 text-[11px]">
              Your verification was not approved. Please contact support or submit a new request when official verification is available.
            </p>
          </div>
        )}
      </div>

      {/* Verification Submission Form for unverified/rejected users */}
      {(status === "unverified" || status === "rejected") && (
        <form onSubmit={handleSubmitRequest} className="mt-6 rounded-xl border border-line bg-card p-5 space-y-4 text-xs">
          <h2 className="text-sm font-semibold text-ink">Submit Verification Request</h2>
          <p className="text-muted text-[11px]">
            Prepare your identity profile for verification. Selecting a gender or uploading a photo does not automatically mark an account as verified.
          </p>

          <div>
            <label className="block text-muted font-medium">Full Legal Name (as on official ID)</label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Full name as printed on ID"
            />
          </div>

          <div>
            <label className="block text-muted font-medium">Preferred Identity Provider</label>
            <select
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="digilocker">DigiLocker Digital ID (Coming Soon)</option>
              <option value="passport">Passport Travel Verification (Coming Soon)</option>
              <option value="driving_license">Government Driving License (Coming Soon)</option>
            </select>
            <p className="mt-1 text-[11px] text-muted">
              Real identity documents and Aadhaar numbers will only be processed once secure third-party provider integration is active.
            </p>
          </div>

          <label className="flex items-start gap-2 pt-1 text-[11px] text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-line text-forest focus:ring-forest"
            />
            <span>
              I understand that identity verification requires authentic third-party verification and will remain in <strong>Pending</strong> status until verified through an official provider.
            </span>
          </label>

          {notice && (
            <div className="rounded-lg bg-sand p-3 text-xs text-ink border border-line font-medium">
              {notice}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full rounded-lg py-2.5 font-semibold text-xs transition-colors"
          >
            Submit for Identity Verification
          </button>
        </form>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(currentUser.compatibilityAnswers ? "/app" : "/quiz")}
          className="btn-primary w-full sm:flex-1 rounded-lg py-2.5 font-semibold text-xs text-center"
        >
          {currentUser.compatibilityAnswers ? "Continue to Dashboard →" : "Continue to Compatibility Quiz →"}
        </button>
        <Link
          href="/app/profile"
          className="btn-secondary w-full sm:w-auto rounded-lg px-4 py-2.5 font-medium text-xs text-center"
        >
          View Profile
        </Link>
      </div>
    </main>
  );
}
