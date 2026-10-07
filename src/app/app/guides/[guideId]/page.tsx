"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Breakdown } from "@/components/Compatibility";
import { guideCompatibility, useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

function GuideInner() {
  const { guideId } = useParams<{ guideId: string }>();
  const search = useSearchParams();
  const { guides, reviews, users, trips, groups, currentUser, requestGuide, guideRequests } = useApp();

  const guide = guides.find((g) => g.id === guideId);
  const groupId = search.get("group") ?? groups.find((g) => g.memberIds.includes(currentUser?.id ?? ""))?.id;
  const trip = trips.find((t) => t.id === groups.find((g) => g.id === groupId)?.tripId);

  const [notice, setNotice] = useState<string | null>(null);

  if (!guide) return <main className="p-8 text-center text-sm text-muted">Guide not found.</main>;

  const score = currentUser ? guideCompatibility(currentUser, guide) : null;
  const greviews = reviews.filter((r) => r.reviewedUserId === guide.id && r.isGuideReview && r.verifiedTrip);

  const isRequested = (guideRequests || []).some(
    (r) => r.guideId === guide.id && r.fromUserId === currentUser?.id && r.status === "pending"
  );

  function handleRequest() {
    const res = requestGuide(guide!.id, {
      destination: trip?.destination || guide!.location,
      dates: trip ? `${trip.startDate} → ${trip.endDate}` : "Upcoming trip",
      budget: trip ? `₹${trip.budgetMin}–₹${trip.budgetMax}` : `₹${guide!.pricePerDay * 3}`,
      interests: guide!.specialties,
      travelersCount: 2,
      groupId: groupId || undefined,
    });
    setNotice(res.message);
    setTimeout(() => setNotice(null), 4000);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/app/guides" className="text-xs text-muted hover:text-ink mb-4 inline-block">
        ← Back to Guides
      </Link>

      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={guide.name} photo={guide.photo} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-ink">{guide.name}</h1>
                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
                  Verified Local Guide
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                📍 {guide.location} • ★ {guide.rating} ({guide.verifiedTrips} trips led)
              </p>
              <p className="text-xs text-muted">
                Languages: {guide.languages.join(" • ")}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink">
                ₹{guide.pricePerDay.toLocaleString("en-IN")}/day
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <button
              disabled={isRequested}
              onClick={handleRequest}
              className={`rounded-lg px-5 py-2 text-xs font-semibold transition-colors ${
                isRequested
                  ? "bg-sand/40 text-muted border border-line cursor-not-allowed"
                  : "btn-primary"
              }`}
            >
              {isRequested ? "Request Pending" : "Request Guide"}
            </button>
          </div>
        </div>

        {notice && (
          <div className="mt-4 rounded-lg bg-sand/70 p-3 text-xs font-medium text-ink border border-line">
            {notice}
          </div>
        )}

        {/* Bio */}
        <div className="mt-5 pt-4 border-t border-line text-xs leading-relaxed text-muted">
          <h2 className="font-semibold text-ink mb-1">About</h2>
          <p>{guide.bio}</p>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Specialties</span>
            <span className="font-medium text-ink mt-0.5 block">{guide.specialties.join(", ")}</span>
          </div>
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Areas Covered</span>
            <span className="font-medium text-ink mt-0.5 block">{guide.areasCovered.join(", ")}</span>
          </div>
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Experience</span>
            <span className="font-medium text-ink mt-0.5 block">{guide.experienceYears} Years</span>
          </div>
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Certifications</span>
            <span className="font-medium text-ink mt-0.5 block">{guide.certifications.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Compatibility Breakdown */}
      {score && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <Breakdown score={score} />
        </section>
      )}

      {/* Verified Reviews */}
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-ink">
          Verified Reviews ({greviews.length})
        </h2>
        {greviews.length === 0 ? (
          <p className="mt-2 text-xs text-muted">No verified reviews recorded yet for this guide.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {greviews.map((r) => {
              const reviewer = users.find((u) => u.id === r.reviewerId);
              return (
                <div key={r.id} className="rounded-lg bg-paper p-3 border border-line text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{reviewer?.name || "Traveler"}</span>
                    <span className="text-amber-700 font-medium">★ {r.rating}</span>
                  </div>
                  <p className="mt-1 text-muted leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function GuideProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading guide profile...</div>}>
      <GuideInner />
    </Suspense>
  );
}
