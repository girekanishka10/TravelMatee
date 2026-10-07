"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

export default function GuideDashboardPage() {
  const { currentGuide, guideRequests, respondGuideRequest, logout } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "all">("pending");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!currentGuide) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="font-serif text-2xl font-bold">Guide Portal Access</h1>
        <p className="mt-2 text-sm text-muted">You must be signed in as a registered guide to view this dashboard.</p>
        <Link
          href="/login?role=guide"
          className="btn-primary mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold"
        >
          Guide Sign In
        </Link>
      </main>
    );
  }

  // Filter requests for this guide
  const myRequests = (guideRequests || []).filter((r) => r.guideId === currentGuide.id);
  const pendingRequests = myRequests.filter((r) => r.status === "pending");
  const acceptedRequests = myRequests.filter((r) => r.status === "accepted");

  const displayList =
    activeTab === "pending"
      ? pendingRequests
      : activeTab === "accepted"
      ? acceptedRequests
      : myRequests;

  function handleAction(requestId: string, accept: boolean) {
    const res = respondGuideRequest(requestId, accept);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Guide Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-4">
          <Avatar name={currentGuide.name} photo={currentGuide.photo} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-ink">{currentGuide.name}</h1>
              <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
                Certified Guide
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              📍 {currentGuide.location} • {currentGuide.experienceYears} yrs exp • ₹{currentGuide.pricePerDay.toLocaleString("en-IN")}/day
            </p>
            <p className="text-xs text-muted">Languages: {currentGuide.languages.join(", ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              logout();
              router.push("/login?role=guide");
            }}
            className="rounded-lg border border-line px-3.5 py-1.5 text-xs text-muted hover:text-ink hover:bg-sand transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="mt-4 rounded-lg bg-sand/70 p-3 text-xs text-ink font-medium border border-line">
          {actionNotice}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-card p-4">
          <p className="text-xs uppercase text-muted font-medium">Pending Requests</p>
          <p className="mt-1 text-2xl font-bold text-ink">{pendingRequests.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-4">
          <p className="text-xs uppercase text-muted font-medium">Accepted Trips</p>
          <p className="mt-1 text-2xl font-bold text-forest">{acceptedRequests.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-4">
          <p className="text-xs uppercase text-muted font-medium">Verified Reviews</p>
          <p className="mt-1 text-2xl font-bold text-ink">★ {currentGuide.rating}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center justify-between border-b border-line pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`text-sm pb-2 font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Pending Inquiries ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`text-sm pb-2 font-medium border-b-2 transition-colors ${
              activeTab === "accepted"
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Accepted Trips ({acceptedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`text-sm pb-2 font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            All Requests ({myRequests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="mt-6 space-y-4">
        {displayList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
            No {activeTab} guide requests at this time.
          </div>
        ) : (
          displayList.map((req) => (
            <article
              key={req.id}
              className="rounded-xl border border-line bg-card p-5 transition-shadow hover:border-forest/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {req.travelerPhoto ? (
                    <img
                      src={req.travelerPhoto}
                      alt={req.travelerName}
                      className="h-11 w-11 rounded-full object-cover border border-line"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-sand flex items-center justify-center text-sm font-medium">
                      {req.travelerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">{req.travelerName}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                          req.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : req.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      Destination: <strong className="text-ink">{req.destination}</strong> • Dates: {req.dates}
                    </p>
                    <p className="text-xs text-muted">
                      Group Size: <strong className="text-ink">{req.travelersCount} travelers</strong> • Budget: {req.budget}
                    </p>
                  </div>
                </div>

                {req.compatibilityScore && (
                  <div className="sm:text-right">
                    <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-semibold text-forest">
                      {req.compatibilityScore}% Compatibility
                    </span>
                  </div>
                )}
              </div>

              {/* Interests & Notes */}
              <div className="mt-3.5 pt-3.5 border-t border-line text-xs">
                {req.interests && req.interests.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-muted">Trip Interests:</span>
                    {req.interests.map((interest, i) => (
                      <span key={i} className="rounded-md bg-sand px-2 py-0.5 text-[11px] text-ink">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                {req.notes && (
                  <p className="text-muted leading-relaxed">
                    <strong className="text-ink">Traveler note:</strong> {req.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-line">
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAction(req.id, false)}
                      className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium hover:text-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, true)}
                      className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
                    >
                      Accept Request
                    </button>
                  </>
                )}

                {req.status === "accepted" && req.groupId && (
                  <Link
                    href={`/app/messages/${req.groupId}`}
                    className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    Open Group Chat →
                  </Link>
                )}

                {req.fromUserId && (
                  <Link
                    href={`/app/travelers/${req.fromUserId}`}
                    className="btn-secondary rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    View Traveler Profile
                  </Link>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
