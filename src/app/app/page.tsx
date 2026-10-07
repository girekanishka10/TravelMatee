"use client";

import Link from "next/link";
import { firstName, formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

export default function HomePage() {
  const { currentUser, currentGuide, trips, groups, invitations, recommendedTravelers, exploreTrips } = useApp();

  // If user is a guide, redirect or provide link to Guide Dashboard
  if (currentGuide) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 text-center">
        <h1 className="font-serif text-2xl font-bold">Guide Portal</h1>
        <p className="mt-2 text-sm text-muted">You are logged in as Guide {currentGuide.name}.</p>
        <Link
          href="/app/guide-dashboard"
          className="btn-primary mt-6 inline-block rounded-lg px-5 py-2.5 text-xs font-semibold"
        >
          Open Guide Dashboard →
        </Link>
      </main>
    );
  }

  if (!currentUser) return null;

  const recGroups = exploreTrips({}).slice(0, 3);
  const recPeople = recommendedTravelers().slice(0, 4);
  const upcoming = groups
    .filter((g) => g.memberIds.includes(currentUser.id))
    .map((g) => ({ g, trip: trips.find((t) => t.id === g.tripId)! }))
    .filter((x) => x.trip && x.trip.status !== "completed")
    .slice(0, 3);
  const pendingInvites = (invitations || []).filter((i) => i.toUserId === currentUser.id && i.status === "pending");

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">
            Hi, {firstName(currentUser.name)} 👋
          </h1>
          <p className="mt-1 text-xs text-muted">
            Travel Style:{" "}
            <strong className="text-ink">
              {currentUser.travelPersonality?.title || "Explorer"}
            </strong>{" "}
            • 📍 {currentUser.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/planner"
            className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
          >
            Open Trip Planner →
          </Link>
        </div>
      </div>

      {/* Notifications / Invites */}
      {pendingInvites.length > 0 && (
        <div className="mt-4 rounded-lg border border-forest/30 bg-forest/5 p-3.5 flex items-center justify-between text-xs">
          <span className="text-forest font-medium">
            You have {pendingInvites.length} pending trip invitation{pendingInvites.length > 1 ? "s" : ""}.
          </span>
          <Link href="/app/invites" className="text-forest font-semibold underline">
            Review Invites →
          </Link>
        </div>
      )}

      {/* Core Action Cards (Clean, minimal, no AI stock photos) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/app/explore"
          className="rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🧭</span>
            <h2 className="text-sm font-bold text-ink">Explore Groups</h2>
          </div>
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            Find existing travel groups with open slots matching your destination and budget.
          </p>
          <span className="mt-3 block text-xs font-medium text-forest">Browse groups →</span>
        </Link>

        <Link
          href="/app/create"
          className="rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <h2 className="text-sm font-bold text-ink">Create Group</h2>
          </div>
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            Form your own trip and select compatible travelers without artificial limits.
          </p>
          <span className="mt-3 block text-xs font-medium text-forest">Create trip →</span>
        </Link>

        <Link
          href="/app/guides"
          className="rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏔️</span>
            <h2 className="text-sm font-bold text-ink">Find a Guide</h2>
          </div>
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            Connect with verified local guides for trekking, heritage, and regional logistics.
          </p>
          <span className="mt-3 block text-xs font-medium text-forest">Search guides →</span>
        </Link>
      </div>

      {/* GROUPS LOOKING FOR TRAVELERS */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-serif text-lg font-bold text-ink">Groups Looking for Travelers</h2>
          <Link href="/app/explore" className="text-xs text-forest hover:underline font-medium">
            View All →
          </Link>
        </div>

        {recGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted">
            No groups currently recruiting travelers. Create your own group to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {recGroups.map(({ trip, group, score }) => {
              const filled = group.memberIds.length;
              const max = trip.groupSize;
              const lookingFor = max - filled;

              return (
                <div
                  key={trip.id}
                  className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-forest/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{trip.destination} Trip</h3>
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest capitalize">
                        {trip.travelStyle}
                      </span>
                      {score && (
                        <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-ink">
                          {score.overall}% Match
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      📅 {formatDateRange(trip.startDate, trip.endDate)} • 💰 {formatINR(trip.budgetMin)}–{formatINR(trip.budgetMax)}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-forest">
                      👥 {filled}/{max} travelers • Looking for {lookingFor} more
                    </p>
                  </div>

                  <Link
                    href={`/app/explore/${trip.id}`}
                    className="btn-primary rounded-lg px-3.5 py-1.5 text-xs self-end sm:self-center shrink-0"
                  >
                    View Group
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RECOMMENDED TRAVELERS */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-serif text-lg font-bold text-ink">Compatible Travelers</h2>
          <Link href="/app/people" className="text-xs text-forest hover:underline font-medium">
            Find People →
          </Link>
        </div>

        {recPeople.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted">
            No travelers found. Newly registered travelers will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recPeople.map(({ user, score }) => (
              <div
                key={user.id}
                className="rounded-xl border border-line bg-card p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={user.name} photo={user.profilePhoto} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                    <p className="text-[11px] text-muted">{user.city} • {score.overall}% match</p>
                  </div>
                </div>

                <Link
                  href={`/app/travelers/${user.id}`}
                  className="text-xs text-forest font-medium hover:underline shrink-0"
                >
                  Profile →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* UPCOMING TRIPS */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-serif text-lg font-bold text-ink">My Upcoming Trips</h2>
          <Link href="/app/trips" className="text-xs text-forest hover:underline font-medium">
            Manage Trips →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted">
            You don&apos;t have any active groups yet. Explore open groups or create one.
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map(({ g, trip }) => (
              <div
                key={g.id}
                className="rounded-xl border border-line bg-card p-3.5 flex items-center justify-between text-xs"
              >
                <div>
                  <h3 className="font-semibold text-ink text-sm">{trip.destination}</h3>
                  <p className="text-muted mt-0.5">
                    {formatDateRange(trip.startDate, trip.endDate)} • {g.memberIds.length}/{trip.groupSize} travelers
                  </p>
                </div>
                <Link
                  href={`/app/trips/${g.id}`}
                  className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink hover:bg-sand transition-colors"
                >
                  Manage Group
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
