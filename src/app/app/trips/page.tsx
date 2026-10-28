"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function MyTripsPage() {
  const { currentUser, currentGuide, groups, trips, leaveGroup } = useApp();
  const [leaveTarget, setLeaveTarget] = useState<{ id: string; name: string; isCreator: boolean; memberCount: number } | null>(null);
  const [actionNotice, setActionNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const actorId = currentUser?.id || currentGuide?.id;
  if (!actorId) return null;

  function handleConfirmLeave() {
    if (!leaveTarget) return;
    const res = leaveGroup(leaveTarget.id);
    setActionNotice({ text: res.message, error: !res.success });
    setLeaveTarget(null);
    setTimeout(() => setActionNotice(null), 4000);
  }

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

      {actionNotice && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs ${
            actionNotice.error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-forest/30 bg-forest/10 text-forest"
          }`}
        >
          {actionNotice.text}
        </div>
      )}

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
            const isMember = g.memberIds.includes(actorId);

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

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
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
                  {isMember && (
                    <button
                      type="button"
                      onClick={() =>
                        setLeaveTarget({
                          id: g.id,
                          name: `${trip.destination} Trip`,
                          isCreator: g.creatorId === actorId,
                          memberCount: filled,
                        })
                      }
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                      Leave Group
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {leaveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-ink">Leave Group</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Are you sure you want to leave <strong className="text-ink">{leaveTarget.name}</strong>?
            </p>
            {leaveTarget.isCreator && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
                {leaveTarget.memberCount > 1
                  ? "Notice: You are the creator of this group. Since there are other members, leadership will be transferred to another member."
                  : "Notice: You are the sole member and creator of this group. You cannot leave an empty trip without deleting or managing it."}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLeaveTarget(null)}
                className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Confirm Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
