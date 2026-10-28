"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatDateRange } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar, FemaleTag } from "@/components/Ui";

export default function ChatPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const {
    groups,
    trips,
    users,
    messages,
    currentUser,
    currentGuide,
    sendMessage,
    guides,
    markMessagesAsRead,
  } = useApp();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const actorId = currentUser?.id || currentGuide?.id || "";
  const isDm = Boolean(groupId && groupId.startsWith("dm_"));

  // Lookup for Direct Message
  const otherUser = isDm ? users.find((u) => u.id !== actorId && groupId.includes(u.id)) : null;
  const otherGuide = isDm ? guides.find((g) => g.id !== actorId && groupId.includes(g.id)) : null;
  const otherPerson = otherUser || otherGuide;

  // Lookup for Group Chat
  const group = !isDm ? groups.find((g) => g.id === groupId) : null;
  const trip = !isDm ? trips.find((t) => t.id === group?.tripId) : null;
  const guide = !isDm ? guides.find((g) => g.id === trip?.guideId) : null;

  // Mark messages as read whenever conversation is viewed
  useEffect(() => {
    if (groupId) {
      markMessagesAsRead(groupId);
    }
  }, [groupId, messages.length, markMessagesAsRead]);

  // Thread filtering and chronological ordering
  const thread = messages
    .filter((m) => m.groupId === groupId || m.conversationId === groupId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Auto-scroll to bottom on thread changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  if (!actorId) {
    return (
      <main className="p-8 text-center text-sm text-muted">
        Please sign in or switch to an active account to view messages.
      </main>
    );
  }

  if (isDm) {
    if (!groupId.includes(actorId)) {
      return (
        <main className="mx-auto max-w-md p-8 text-center text-sm text-muted">
          <p>You do not have permission to view this conversation.</p>
          <Link href="/app/messages" className="mt-4 inline-block text-xs text-forest underline">
            Back to Messages
          </Link>
        </main>
      );
    }

    if (!otherPerson) {
      return (
        <main className="p-8 text-center text-sm text-muted">
          <p>Traveler conversation not found.</p>
          <Link href="/app/messages" className="mt-4 inline-block text-xs text-forest underline">
            Back to Messages
          </Link>
        </main>
      );
    }

    const otherProfilePhoto =
      (otherPerson as { profilePhoto?: string; photo?: string })?.profilePhoto ||
      (otherPerson as { photo?: string })?.photo;

    function onSendDm(e: FormEvent) {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || !otherPerson) return;
      sendMessage(groupId, trimmed, "text", otherPerson.id);
      setText("");
    }

    return (
      <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col px-6 py-6">
        {/* Top Header */}
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/app/messages"
                className="text-xs text-muted hover:text-ink font-semibold mr-1"
                title="Back to all conversations"
              >
                ←
              </Link>
              <Avatar name={otherPerson.name} photo={otherProfilePhoto} size="md" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-lg font-bold text-ink">{otherPerson.name}</h1>
                  {"gender" in otherPerson && otherPerson.gender === "female" && <FemaleTag />}
                  {"verificationStatus" in otherPerson && otherPerson.verificationStatus === "verified" && (
                    <span className="rounded-full bg-forest/10 px-1.5 py-0.2 text-[10px] font-medium text-forest">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  📍 {("city" in otherPerson && otherPerson.city) || ("location" in otherPerson && otherPerson.location) || "Traveler"} • Direct Message
                </p>
              </div>
            </div>

            <Link
              href={"city" in otherPerson ? `/app/travelers/${otherPerson.id}` : `/app/guides/${otherPerson.id}`}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-sand transition-colors shrink-0"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Message Thread */}
        <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto min-h-[300px]">
          {thread.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted">
              <p>No messages yet in this conversation.</p>
              <p className="mt-1 text-[11px]">Send a greeting to break the ice with {otherPerson.name}!</p>
            </div>
          ) : (
            thread.map((m) => {
              const mine = m.senderId === actorId;

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
                      <p className="text-[10px] font-semibold text-muted mb-0.5">{otherPerson.name}</p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                    <span className="mt-1 block text-[9px] opacity-70 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={onSendDm} className="mt-4 flex gap-2 pt-3 border-t border-line">
          <input
            className="flex-1 rounded-lg border border-line bg-card px-4 py-2.5 text-xs text-ink outline-none focus:border-forest"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${otherPerson.name}...`}
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

  // GROUP CHAT
  if (!group || !trip) {
    return (
      <main className="p-8 text-center text-sm text-muted">
        <p>Chat not found.</p>
        <Link href="/app/messages" className="mt-4 inline-block text-xs text-forest underline">
          Back to Messages
        </Link>
      </main>
    );
  }

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

  function onSubmitGroup(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !group) return;
    sendMessage(group.id, trimmed);
    setText("");
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col px-6 py-6">
      {/* Group Chat Top Header */}
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/app/messages"
              className="text-xs text-muted hover:text-ink font-semibold mr-1"
              title="Back to all conversations"
            >
              ←
            </Link>
            <div>
              <h1 className="font-serif text-xl font-bold text-ink">{trip.destination} Group Chat</h1>
              <p className="text-xs text-muted">
                📅 {formatDateRange(trip.startDate, trip.endDate)} • {group.memberIds.length} members
              </p>
            </div>
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
            const senderName =
              senderUser?.name || senderGuide?.name || (m.senderId === "system" ? "System" : "Traveler");

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
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  <span className="mt-1 block text-[9px] opacity-70 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message Input */}
      <form onSubmit={onSubmitGroup} className="mt-4 flex gap-2 pt-3 border-t border-line">
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
