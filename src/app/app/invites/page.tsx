"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

export default function InvitesPage() {
  const { invitations, trips, groups, users, currentUser, respondInvite } = useApp();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  if (!currentUser) return null;

  const received = (invitations || []).filter(
    (i) => i.toUserId === currentUser.id || i.invitedUserId === currentUser.id
  );

  const sent = (invitations || []).filter(
    (i) => i.senderId === currentUser.id || i.fromUserId === currentUser.id
  );

  function handleRespond(invId: string, accept: boolean) {
    const res = respondInvite(invId, accept);
    setNotice({ text: res.message, error: !res.success });
    setTimeout(() => setNotice(null), 4000);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Trip Invitations</h1>
        <p className="mt-1 text-sm text-muted">
          Review incoming group invitations from fellow travelers, or check the status of invitations you sent.
        </p>
      </div>

      {notice && (
        <div
          className={`mt-4 rounded-lg px-4 py-2.5 text-xs font-medium border ${
            notice.error
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-[#eef5f0] text-[#153a25] border-[#b5d2be]"
          }`}
        >
          {notice.error ? "✕ " : "✓ "} {notice.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex border-b border-line">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`pb-2.5 text-xs font-medium border-b-2 mr-6 transition-colors ${
            tab === "received"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Received Invitations ({received.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            tab === "sent"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Sent Invitations ({sent.length})
        </button>
      </div>

      {/* Content */}
      <div className="mt-6 space-y-3.5">
        {tab === "received" ? (
          received.length === 0 ? (
            <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
              No incoming group invitations right now.
            </div>
          ) : (
            received.map((inv) => {
              const group = groups.find((g) => g.id === inv.groupId);
              const trip = trips.find((t) => t.id === (inv.tripId || group?.tripId));
              const from = users.find((u) => u.id === inv.senderId || u.id === inv.fromUserId);
              const memberCount = group?.memberIds.length ?? 0;
              const maxCount = trip?.groupSize ?? 5;
              const isGroupFull = memberCount >= maxCount;

              return (
                <article key={inv.id} className="rounded-xl border border-line bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={from?.name || "Organizer"} photo={from?.profilePhoto} size="md" />
                      <div>
                        <h2 className="font-serif text-lg font-bold text-ink">
                          {trip?.destination || "Group Trip"}
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                          Invited by <strong className="text-ink">{from?.name || "Trip Organizer"}</strong>
                          {from?.city && ` (${from.city})`}
                        </p>
                      </div>
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

                  {/* Trip Details Grid */}
                  {trip && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-paper rounded-lg p-3 border border-line">
                      <div>
                        <span className="text-muted block text-[11px]">Dates</span>
                        <span className="font-medium text-ink block mt-0.5">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Est. Budget</span>
                        <span className="font-medium text-ink block mt-0.5">
                          {formatINR(trip.budgetMin)}–{formatINR(trip.budgetMax)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Group Capacity</span>
                        <span className={`font-medium block mt-0.5 ${isGroupFull ? "text-red-600 font-semibold" : "text-ink"}`}>
                          {memberCount}/{maxCount} members {isGroupFull ? "(Full)" : ""}
                        </span>
                      </div>
                      {trip.startingLocation && (
                        <div>
                          <span className="text-muted block text-[11px]">Starting Point</span>
                          <span className="font-medium text-ink block mt-0.5">
                            {trip.startingLocation}
                          </span>
                        </div>
                      )}
                      {trip.travelStyle && (
                        <div>
                          <span className="text-muted block text-[11px]">Travel Style</span>
                          <span className="font-medium text-ink block mt-0.5 capitalize">
                            {trip.travelStyle}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {trip?.description && (
                    <p className="text-xs text-muted mt-3 line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  {inv.status === "pending" && (
                    <div className="mt-4 flex gap-2.5 pt-3 border-t border-line">
                      <button
                        onClick={() => handleRespond(inv.id, false)}
                        className="btn-secondary flex-1 rounded-lg py-2 text-xs font-medium hover:text-red-700"
                      >
                        Decline
                      </button>
                      <button
                        disabled={isGroupFull}
                        onClick={() => handleRespond(inv.id, true)}
                        className={`flex-1 rounded-lg py-2 text-xs font-semibold ${
                          isGroupFull
                            ? "bg-sand text-muted cursor-not-allowed border border-line"
                            : "btn-primary"
                        }`}
                      >
                        {isGroupFull ? "Group is Full" : "Accept & Join Group"}
                      </button>
                    </div>
                  )}

                  {inv.status === "accepted" && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-line">
                      <Link
                        href={`/app/trips/${inv.groupId}`}
                        className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold"
                      >
                        Open Group Details →
                      </Link>
                      <Link
                        href={`/app/messages/${inv.groupId}`}
                        className="btn-secondary rounded-lg px-4 py-1.5 text-xs font-semibold"
                      >
                        Open Group Chat
                      </Link>
                    </div>
                  )}
                </article>
              );
            })
          )
        ) : (
          sent.length === 0 ? (
            <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
              You haven&apos;t sent any trip invitations yet. Visit{" "}
              <Link href="/app/people" className="text-forest underline font-medium">
                Find People
              </Link>{" "}
              to invite travelers to your groups.
            </div>
          ) : (
            sent.map((inv) => {
              const group = groups.find((g) => g.id === inv.groupId);
              const trip = trips.find((t) => t.id === (inv.tripId || group?.tripId));
              const recipient = users.find((u) => u.id === inv.toUserId || u.id === inv.invitedUserId);

              return (
                <article key={inv.id} className="rounded-xl border border-line bg-card p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar name={recipient?.name || "Traveler"} photo={recipient?.profilePhoto} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-ink text-sm">
                          {recipient?.name || "Invited Traveler"}
                        </h2>
                        {recipient?.city && (
                          <span className="text-muted text-[11px]">• {recipient.city}</span>
                        )}
                      </div>
                      <p className="text-muted text-xs mt-0.5">
                        Invited to: <strong className="text-ink">{trip?.destination || "Group Trip"}</strong>
                        {trip && ` (${formatDateRange(trip.startDate, trip.endDate)})`}
                      </p>
                      <span className="text-[10px] text-muted block mt-0.5">
                        Sent on {new Date(inv.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                        inv.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : inv.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-[#e2ede5] text-[#153a25] border border-[#b5d2be]"
                      }`}
                    >
                      {inv.status === "pending" ? "Pending" : inv.status}
                    </span>
                  </div>
                </article>
              );
            })
          )
        )}
      </div>
    </main>
  );
}
