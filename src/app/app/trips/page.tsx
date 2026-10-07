"use client";

import Link from "next/link";
import { formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function MyTripsPage() {
  const { currentUser, currentGuide, groups, trips } = useApp();

  const actorId = currentUser?.id || currentGuide?.id;
  if (!actorId) return null;

  const mine = groups
    .filter(
      (g) =>
        g.memberIds.includes(actorId) ||
        g.creatorId === actorId ||
        g.pendingInviteIds.includes(actorId) ||
        g.joinRequestIds.includes(actorId)
    )
    .map((g) => ({ g, trip: trips.find((t) => t.id === g.tripId)! }))
    .filter((x) => Boolean(x.trip));

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">My Trips</h1>
          <p className="mt-1 text-xs text-muted">Your active, planned, and formed travel groups.</p>
        </div>
        <Link
          href="/app/create"
          className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
        >
          + Create New Group
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
            You don&apos;t have any trips yet.{" "}
            <Link href="/app/explore" className="text-forest underline font-medium">
              Explore open groups
            </Link>{" "}
            or{" "}
            <Link href="/app/create" className="text-forest underline font-medium">
              create your own
            </Link>.
          </div>
        ) : (
          mine.map(({ g, trip }) => {
            const filled = g.memberIds.length;
            const max = trip.groupSize;
            const isFull = filled >= max;

            return (
              <article
                key={g.id}
                className="rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-ink">{trip.destination} Trip</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        isFull ? "bg-sand text-muted" : "bg-forest/10 text-forest"
                      }`}
                    >
                      {isFull ? "Group Full" : g.recruiting ? "Recruiting Active" : "Forming"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    📅 {formatDateRange(trip.startDate, trip.endDate)} • 💰 {formatINR(trip.budgetMin)}–{formatINR(trip.budgetMax)}
                  </p>

                  <p className="mt-0.5 text-xs text-muted">
                    👥 <strong className="text-ink">{filled}/{max} travelers</strong> {g.recruiting && !isFull ? `(Looking for ${max - filled} more)` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/app/messages/${g.id}`}
                    className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                  >
                    Chat
                  </Link>
                  <Link
                    href={`/app/trips/${g.id}`}
                    className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold"
                  >
                    Manage Group
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
