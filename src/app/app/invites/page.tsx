"use client";

import Link from "next/link";
import { formatDateRange } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function InvitesPage() {
  const { invitations, trips, users, currentUser, respondInvite } = useApp();
  if (!currentUser) return null;

  const mine = (invitations || []).filter(
    (i) => i.toUserId === currentUser.id || i.invitedUserId === currentUser.id
  );

  return (
    <main className="mx-auto max-w-xl px-5 py-8">
      <h1 className="font-serif text-3xl font-bold text-ink">Group Invitations</h1>
      <p className="mt-1 text-sm text-muted">
        When someone invites you to their trip group, you can review details and decide to join.
      </p>

      <div className="mt-6 space-y-3.5">
        {mine.map((inv) => {
          const trip = trips.find((t) => t.id === inv.tripId);
          const from = users.find((u) => u.id === inv.senderId || u.id === inv.fromUserId);

          return (
            <article key={inv.id} className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-ink">
                    {trip?.destination || "Group Trip"}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Invited by <strong className="text-ink">{from?.name || "Group Creator"}</strong>
                    {trip && ` • ${formatDateRange(trip.startDate, trip.endDate)}`}
                  </p>
                  {trip?.description && (
                    <p className="text-xs text-muted mt-2 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize shrink-0 ${
                    inv.status === "accepted"
                      ? "bg-emerald-100 text-emerald-800"
                      : inv.status === "declined"
                      ? "bg-red-100 text-red-800"
                      : "bg-[#e2ede5] text-[#153a25] border border-[#b5d2be]"
                  }`}
                >
                  {inv.status}
                </span>
              </div>

              {inv.status === "pending" && (
                <div className="mt-4 flex gap-2.5 pt-3 border-t border-line">
                  <button
                    onClick={() => respondInvite(inv.id, false)}
                    className="btn-secondary flex-1 rounded-lg py-2 text-xs font-medium hover:text-red-700"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => respondInvite(inv.id, true)}
                    className="btn-primary flex-1 rounded-lg py-2 text-xs font-semibold"
                  >
                    Accept & Join Group
                  </button>
                </div>
              )}

              {inv.status === "accepted" && (
                <div className="mt-3 pt-2 border-t border-line">
                  <Link
                    href={`/app/trips/${inv.groupId}`}
                    className="btn-primary inline-flex rounded-lg px-4 py-1.5 text-xs font-semibold"
                  >
                    Open Group Details →
                  </Link>
                </div>
              )}
            </article>
          );
        })}

        {mine.length === 0 && (
          <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
            No pending group invitations right now.
          </div>
        )}
      </div>
    </main>
  );
}
