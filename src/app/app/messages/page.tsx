"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

export default function MessagesIndex() {
  const { currentUser, currentGuide, groups, trips, messages, users, guides, getDmConversationId } = useApp();
  const [tab, setTab] = useState<"all" | "dm" | "groups">("all");
  const actorId = currentUser?.id || currentGuide?.id;
  if (!actorId) return null;

  // 1. Group Conversations
  const groupChats = groups
    .filter((g) => g.memberIds.includes(actorId) || g.creatorId === actorId)
    .map((g) => {
      const trip = trips.find((t) => t.id === g.tripId);
      const groupMsgs = messages.filter((m) => m.groupId === g.id || m.conversationId === g.id);
      const last = groupMsgs[groupMsgs.length - 1];
      const unreadCount = groupMsgs.filter(
        (m) => m.senderId !== actorId && (!m.readBy || !m.readBy.includes(actorId))
      ).length;
      return { g, trip, last, unreadCount, type: "group" as const };
    })
    .filter((x) => Boolean(x.trip));

  // 2. Direct Conversations (DMs)
  // Find all distinct DM conversation IDs where actor is a participant
  const dmMessages = messages.filter((m) => {
    const isDm = (m.groupId && m.groupId.startsWith("dm_")) || (m.conversationId && m.conversationId.startsWith("dm_"));
    if (!isDm) return false;
    const convId = m.conversationId || m.groupId;
    return convId.includes(actorId) || m.senderId === actorId || m.recipientId === actorId;
  });

  const dmConvIds = Array.from(
    new Set(dmMessages.map((m) => m.conversationId || m.groupId))
  );

  const dmChats = dmConvIds.map((convId) => {
    const convMsgs = messages.filter((m) => m.groupId === convId || m.conversationId === convId);
    const last = convMsgs[convMsgs.length - 1];
    const unreadCount = convMsgs.filter(
      (m) => m.senderId !== actorId && (!m.readBy || !m.readBy.includes(actorId))
    ).length;

    // Identify the other participant
    const otherUser = users.find((u) => u.id !== actorId && convId.includes(u.id));
    const otherGuide = guides.find((g) => g.id !== actorId && convId.includes(g.id));
    const otherPerson = otherUser || otherGuide;

    return {
      convId,
      otherPerson,
      last,
      unreadCount,
      type: "dm" as const,
    };
  }).filter((x) => Boolean(x.otherPerson));

  // Combine and sort by latest message timestamp
  const allChats = [
    ...groupChats.map((gc) => ({
      id: gc.g.id,
      href: `/app/messages/${gc.g.id}`,
      title: `${gc.trip?.destination} Group`,
      subtitle: gc.last ? `${gc.last.senderId === actorId ? "You: " : ""}${gc.last.message}` : "No messages yet",
      timestamp: gc.last?.timestamp,
      unreadCount: gc.unreadCount,
      isGroup: true,
      avatar: null,
      badge: "Group",
    })),
    ...dmChats.map((dc) => ({
      id: dc.convId,
      href: `/app/messages/${dc.convId}`,
      title: dc.otherPerson?.name || "Traveler",
      subtitle: dc.last ? `${dc.last.senderId === actorId ? "You: " : ""}${dc.last.message}` : "Direct conversation started",
      timestamp: dc.last?.timestamp,
      unreadCount: dc.unreadCount,
      isGroup: false,
      avatar: {
        name: dc.otherPerson?.name || "Traveler",
        photo: (dc.otherPerson as { profilePhoto?: string; photo?: string })?.profilePhoto || (dc.otherPerson as { photo?: string })?.photo,
      },
      badge: "Direct",
    })),
  ].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  const displayedChats =
    tab === "groups"
      ? allChats.filter((c) => c.isGroup)
      : tab === "dm"
      ? allChats.filter((c) => !c.isGroup)
      : allChats;

  // Other travelers for quick start
  const otherTravelers = users.filter((u) => u.id !== actorId);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="border-b border-line pb-4">
        <h1 className="font-serif text-3xl font-bold text-ink">Messages</h1>
        <p className="mt-1 text-xs text-muted">
          Connect directly with fellow travelers or discuss plans in your trip groups.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex border-b border-line">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`pb-2.5 text-xs font-medium border-b-2 mr-6 transition-colors ${
            tab === "all"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          All Conversations ({allChats.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("dm")}
          className={`pb-2.5 text-xs font-medium border-b-2 mr-6 transition-colors ${
            tab === "dm"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Direct Messages ({dmChats.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("groups")}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            tab === "groups"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Group Chats ({groupChats.length})
        </button>
      </div>

      {/* Conversations List */}
      <div className="mt-6 space-y-2.5">
        {displayedChats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
            {tab === "dm"
              ? "No direct messages yet. Pick a traveler below to start chatting!"
              : tab === "groups"
              ? "No active group chats yet. Join an open group to begin."
              : "No conversations found yet."}
          </div>
        ) : (
          displayedChats.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="flex items-center justify-between rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {c.avatar ? (
                  <Avatar name={c.avatar.name} photo={c.avatar.photo} size="md" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-ink text-sm font-semibold">
                    👥
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink truncate">{c.title}</h2>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                        c.isGroup
                          ? "bg-sand text-muted"
                          : "bg-[#e2ede5] text-[#153a25] border border-[#b5d2be]"
                      }`}
                    >
                      {c.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted max-w-sm">{c.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                {c.timestamp && (
                  <span className="text-[10px] text-muted">
                    {new Date(c.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                )}
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Quick Start Direct Message section */}
      <div className="mt-8 pt-6 border-t border-line">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Start a Conversation with a Traveler
        </h2>
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-2">
          {otherTravelers.map((traveler) => (
            <Link
              key={traveler.id}
              href={`/app/messages/${getDmConversationId(actorId, traveler.id)}`}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2 hover:border-forest/40 transition-colors text-xs"
            >
              <Avatar name={traveler.name} photo={traveler.profilePhoto} size="xs" />
              <div className="text-left">
                <p className="font-semibold text-ink leading-tight">{traveler.name}</p>
                <p className="text-[10px] text-muted">{traveler.city}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
