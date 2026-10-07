"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

export default function MessagesIndex() {
  const { currentUser, currentGuide, groups, trips, messages } = useApp();
  const actorId = currentUser?.id || currentGuide?.id;
  if (!actorId) return null;

  const chats = groups
    .filter((g) => g.memberIds.includes(actorId) || g.creatorId === actorId)
    .map((g) => {
      const trip = trips.find((t) => t.id === g.tripId);
      const last = [...messages].reverse().find((m) => m.groupId === g.id);
      return { g, trip, last };
    })
    .filter((x) => Boolean(x.trip));

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="border-b border-line pb-4">
        <h1 className="font-serif text-3xl font-bold text-ink">Messages</h1>
        <p className="mt-1 text-xs text-muted">
          Group conversations for formed trips and accepted guide bookings.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {chats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
            No active group chats yet. Join an open group or accept a trip inquiry to begin.
          </div>
        ) : (
          chats.map(({ g, trip, last }) => (
            <Link
              key={g.id}
              href={`/app/messages/${g.id}`}
              className="block rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">{trip?.destination} Group</h2>
                {last && (
                  <span className="text-[10px] text-muted">
                    {new Date(last.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-muted">
                {last ? `${last.senderId === actorId ? "You: " : ""}${last.message}` : "No messages yet"}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
