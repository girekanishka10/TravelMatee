"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Breakdown } from "@/components/Compatibility";
import { formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar, FemaleTag } from "@/components/Ui";

export default function GroupPublicPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const {
    trips,
    groups,
    users,
    currentUser,
    requestJoin,
    requestJoinWithGroup,
    saveTrip,
    compatibilityWithTrip,
    groupJoinRequests,
    leaveGroup,
  } = useApp();

  const [groupJoinOpen, setGroupJoinOpen] = useState(false);
  const [groupSize, setGroupSize] = useState(2);
  const [memberNames, setMemberNames] = useState("Friend 1, Friend 2");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const trip = trips.find((t) => t.id === tripId);
  const group = groups.find((g) => g.tripId === tripId);

  if (!trip || !group) return <main className="p-8 text-center text-sm text-muted">Group not found.</main>;

  const members = group.memberIds
    .map((id) => users.find((u) => u.id === id) || { id, name: "Group Traveler", profilePhoto: "" })
    .filter(Boolean);

  const score = currentUser ? compatibilityWithTrip(trip.id) : null;
  const isMember = currentUser ? group.memberIds.includes(currentUser.id) : false;
  const isCreator = currentUser ? group.creatorId === currentUser.id : false;
  const singleRequested = currentUser ? group.joinRequestIds.includes(currentUser.id) : false;
  const groupRequested = (groupJoinRequests || []).some(
    (r) => r.groupId === group.id && r.fromUserId === currentUser?.id && r.status === "pending"
  );

  const max = trip.groupSize;
  const filled = group.memberIds.length;
  const availableSlots = Math.max(0, max - filled);
  const isFull = filled >= max;
  const saved = currentUser?.savedTripIds.includes(trip.id);

  function handleSingleJoin() {
    setNotice(null);
    const res = requestJoin(group!.id);
    setNotice({ text: res.message, error: !res.success });
  }

  function handleConfirmLeave() {
    if (!group) return;
    const res = leaveGroup(group.id);
    setNotice({ text: res.message, error: !res.success });
    setLeaveConfirmOpen(false);
  }

  function handleGroupJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const parsedNames = memberNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = requestJoinWithGroup(group!.id, {
      groupName: `${currentUser?.name || "Traveler"}'s Group`,
      size: groupSize,
      memberNames: parsedNames,
      destination: trip!.destination,
      dates: `${trip!.startDate} → ${trip!.endDate}`,
      budget: `${formatINR(trip!.budgetMin)}–${formatINR(trip!.budgetMax)}`,
      interests: trip!.activities,
    });

    setNotice({ text: res.message, error: !res.success });
    if (res.success) {
      setGroupJoinOpen(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      {/* Back link */}
      <Link href="/app/explore" className="text-xs text-muted hover:text-ink mb-4 inline-block">
        ← Back to Explore
      </Link>

      {/* Main Trip Card */}
      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-ink">{trip.destination} Trip</h1>
              <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest capitalize">
                {trip.travelStyle}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              📅 {formatDateRange(trip.startDate, trip.endDate)} • 📍 {trip.startingLocation} → {trip.destination}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              💰 Budget: {formatINR(trip.budgetMin)}–{formatINR(trip.budgetMax)}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            {isFull ? (
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-muted">
                Group Full ({filled}/{max})
              </span>
            ) : (
              <div className="text-right">
                <span className="text-sm font-semibold text-forest">
                  {filled}/{max} Travelers
                </span>
                <p className="text-xs text-muted">Looking for {availableSlots} more</p>
              </div>
            )}
          </div>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            className={`mt-4 rounded-lg p-3 text-xs font-medium border ${
              notice.error ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-line">
          {isCreator ? (
            <Link
              href={`/app/trips/${group.id}`}
              className="btn-primary rounded-lg px-4 py-2 text-xs"
            >
              Manage Your Group →
            </Link>
          ) : isMember ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/app/trips/${group.id}`}
                className="btn-primary rounded-lg px-4 py-2 text-xs"
              >
                Open Group Chat & Details →
              </Link>
              <button
                type="button"
                onClick={() => setLeaveConfirmOpen(true)}
                className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3.5 py-2 text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                Leave Group
              </button>
            </div>
          ) : isFull ? (
            <button
              disabled
              className="rounded-lg bg-sand px-4 py-2 text-xs font-medium text-muted cursor-not-allowed"
            >
              Group is Full
            </button>
          ) : (
            <>
              <button
                disabled={singleRequested || groupRequested}
                onClick={handleSingleJoin}
                className="btn-primary rounded-lg px-4 py-2 text-xs"
              >
                {singleRequested ? "Join Request Sent" : "Request to Join"}
              </button>

              <button
                disabled={singleRequested || groupRequested || availableSlots < 2}
                onClick={() => setGroupJoinOpen(true)}
                className="btn-secondary rounded-lg px-4 py-2 text-xs"
              >
                {groupRequested ? "Group Join Request Sent" : "Join with My Group"}
              </button>
            </>
          )}

          {currentUser && (
            <button
              onClick={() => saveTrip(trip.id)}
              className="rounded-lg border border-line px-3.5 py-2 text-xs text-muted hover:text-ink hover:bg-sand transition-colors ml-auto"
            >
              {saved ? "★ Saved" : "☆ Save Trip"}
            </button>
          )}
        </div>
      </div>

      {/* JOIN WITH MY GROUP MODAL / PANEL */}
      {groupJoinOpen && (
        <div className="mt-6 rounded-xl border border-forest/30 bg-card p-5">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <h2 className="text-sm font-semibold text-ink">Join with My Group</h2>
            <button
              onClick={() => setGroupJoinOpen(false)}
              className="text-xs text-muted hover:text-ink"
            >
              ✕ Close
            </button>
          </div>

          <p className="mt-2 text-xs text-muted">
            Send a combined request with your traveling companions. Available slots in this group:{" "}
            <strong className="text-forest">{availableSlots}</strong>.
          </p>

          <form onSubmit={handleGroupJoinSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted">
                How many people are joining? (Max: {availableSlots})
              </label>
              <input
                type="number"
                min={2}
                max={availableSlots}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">
                Names of members who will join (comma-separated)
              </label>
              <input
                type="text"
                value={memberNames}
                onChange={(e) => setMemberNames(e.target.value)}
                placeholder="e.g. Rahul, Sneha, Amit"
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">Note for group creator</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly introduce your group..."
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGroupJoinOpen(false)}
                className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold"
              >
                Send Group Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compatibility Breakdown */}
      {score && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <Breakdown score={score} />
        </section>
      )}

      {/* Members & Creator Section */}
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-ink">Current Members ({members.length}/{max})</h2>
        <div className="mt-3 divide-y divide-line">
          {members.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <Avatar name={m.name} photo={m.profilePhoto} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-medium text-ink">
                      {m.name} {m.id === trip.creatorId && <span className="text-forest font-semibold">(Creator)</span>}
                    </p>
                    {"gender" in m && m.gender === "female" && <FemaleTag />}
                  </div>
                </div>
              </div>

              {m.id && m.id.startsWith("u_") && !m.id.includes("companion") && (
                <Link
                  href={`/app/travelers/${m.id}`}
                  className="text-xs text-forest hover:underline font-medium"
                >
                  View Profile
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary */}
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-ink">Trip Itinerary</h2>
        <div className="mt-3 space-y-2">
          {trip.itinerary.map((d, i) => (
            <div key={i} className="rounded-lg border border-line bg-paper p-3 text-xs">
              <span className="font-semibold text-forest">{d.day}:</span>{" "}
              <strong className="text-ink">{d.title}</strong>
              <p className="mt-0.5 text-muted">{d.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      {trip.rules && trip.rules.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <h2 className="text-sm font-semibold text-ink">Group Guidelines</h2>
          <ul className="mt-2 space-y-1 text-xs text-muted list-disc pl-4">
            {trip.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </section>
      )}
      {/* LEAVE GROUP CONFIRMATION MODAL */}
      {leaveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Leave Travel Group</h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to leave this group? You will no longer have access to the group chat or member-only coordination.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setLeaveConfirmOpen(false)}
                className="btn-secondary rounded-lg px-3.5 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm & Leave Group
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
