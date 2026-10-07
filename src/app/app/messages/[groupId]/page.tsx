"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatDateRange } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function ChatPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, trips, users, messages, currentUser, currentGuide, sendMessage, guides } = useApp();
  const [text, setText] = useState("");

  const group = groups.find((g) => g.id === groupId);
  const trip = trips.find((t) => t.id === group?.tripId);
  const guide = guides.find((g) => g.id === trip?.guideId);

  const actorId = currentUser?.id || currentGuide?.id || "";

  if (!group || !trip) return <main className="p-8 text-center text-sm text-muted">Chat not found.</main>;

  const isMember = group.memberIds.includes(actorId) || trip.creatorId === actorId || trip.guideId === actorId;

  if (!isMember) {
    return (
      <main className="mx-auto max-w-md p-8 text-center text-sm text-muted">
        <p>You must be an accepted member or assigned guide to view and message in this group chat.</p>
        <Link href={`/app/explore/${trip.id}`} className="mt-4 inline-block text-xs text-forest underline">
          View Trip Details
        </Link>
      </main>
    );
  }

  const thread = messages.filter((m) => m.groupId === group.id);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !group) return;
    sendMessage(group.id, text);
    setText("");
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col px-6 py-6">
      {/* Group Chat Top Header */}
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-ink">{trip.destination} Group Chat</h1>
            <p className="text-xs text-muted">
              📅 {formatDateRange(trip.startDate, trip.endDate)} • {group.memberIds.length} members
            </p>
          </div>
          <Link
            href={`/app/trips/${group.id}`}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-sand transition-colors"
          >
            Group Details
          </Link>
        </div>

        {guide && (
          <p className="mt-2 text-xs text-forest font-medium pt-2 border-t border-line">
            Guide connected: {guide.name} ({guide.location})
          </p>
        )}
      </div>

      {/* Messages Thread */}
      <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto min-h-[300px]">
        {thread.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            No messages yet. Say hello to your fellow travelers!
          </div>
        ) : (
          thread.map((m) => {
            const mine = m.senderId === actorId;
            const senderUser = users.find((u) => u.id === m.senderId);
            const senderGuide = guides.find((g) => g.id === m.senderId);
            const senderName = senderUser?.name || senderGuide?.name || (m.senderId === "system" ? "System" : "Traveler");

            if (m.type === "system") {
              return (
                <div key={m.id} className="text-center py-1">
                  <span className="rounded-full bg-sand px-3 py-1 text-[11px] text-muted">
                    {m.message}
                  </span>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-xs ${
                    mine
                      ? "bg-forest text-white"
                      : "border border-line bg-card text-ink"
                  }`}
                >
                  {!mine && (
                    <p className="text-[10px] font-semibold text-muted mb-0.5">{senderName}</p>
                  )}
                  <p className="leading-relaxed">{m.message}</p>
                  <span className="mt-1 block text-[9px] opacity-70 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Message Input */}
      <form onSubmit={onSubmit} className="mt-4 flex gap-2 pt-3 border-t border-line">
        <input
          className="flex-1 rounded-lg border border-line bg-card px-4 py-2.5 text-xs text-ink outline-none focus:border-forest"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message to the group..."
        />
        <button
          type="submit"
          className="btn-primary rounded-lg px-5 py-2.5 text-xs font-semibold"
        >
          Send
        </button>
      </form>
    </main>
  );
}
