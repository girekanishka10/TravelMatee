"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { User } from "@/lib/types";
import { Avatar, FemaleTag } from "@/components/Ui";

export default function GroupManagePage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const {
    groups,
    trips,
    users,
    currentUser,
    currentGuide,
    respondJoin,
    respondGroupJoinRequest,
    removeMember,
    leaveGroup,
    updateTrip,
    toggleGroupRecruiting,
    guides,
    groupJoinRequests,
    invitations,
  } = useApp();

  const group = groups.find((g) => g.id === groupId);
  const trip = trips.find((t) => t.id === group?.tripId);
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(trip?.description ?? "");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  if (!group || !trip) return <main className="p-8 text-center text-sm text-muted">Group not found.</main>;

  const currentActorId = currentUser?.id || currentGuide?.id || "";
  const isCreator = group.creatorId === currentActorId;
  const isMember = group.memberIds.includes(currentActorId);

  function handleLeaveGroup() {
    setLeaveError(null);
    const res = leaveGroup(group!.id);
    if (res.success) {
      setActionNotice(res.message);
      setLeaveModalOpen(false);
      setTimeout(() => {
        router.push("/app/trips");
      }, 1200);
    } else {
      setLeaveError(res.message);
    }
  }

  const members = group.memberIds
    .map((id) => users.find((u) => u.id === id) || { id, name: id.includes("companion") ? "Group Traveler" : "Traveler", profilePhoto: "" })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const singleRequests: User[] = group.joinRequestIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u));

  // Group join requests targeting this group
  const groupRequests = (groupJoinRequests || []).filter(
    (r) => r.groupId === group.id && r.status === "pending"
  );

  // Invitations sent for this group
  const groupInvites = (invitations || []).filter(
    (i) => i.groupId === group.id
  );

  const guide = guides.find((g) => g.id === trip.guideId);

  const max = trip.groupSize;
  const filled = group.memberIds.length;
  const availableSlots = Math.max(0, max - filled);
  const isFull = filled >= max;

  function handleSingleJoinAction(userId: string, accept: boolean) {
    if (accept && isFull) {
      setActionNotice("Cannot accept: group is already full.");
      return;
    }
    respondJoin(group!.id, userId, accept);
    setActionNotice(accept ? "Traveler accepted into the group." : "Join request declined.");
    setTimeout(() => setActionNotice(null), 3500);
  }

  function handleGroupJoinAction(requestId: string, accept: boolean) {
    const res = respondGroupJoinRequest(requestId, accept);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 3500);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/app/trips" className="text-xs text-muted hover:text-ink mb-4 inline-block">
        ← Back to My Trips
      </Link>

      {/* Main Group Header Card */}
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

        {actionNotice && (
          <div className="mt-4 rounded-lg bg-sand/70 p-3 text-xs font-medium text-ink border border-line">
            {actionNotice}
          </div>
        )}

        {/* Member Action: Leave Group */}
        {isMember && (
          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
            <span className="text-xs text-muted">
              {isCreator ? "You are the creator of this group." : "You are an active member of this group."}
            </span>
            <button
              type="button"
              onClick={() => {
                setLeaveError(null);
                setLeaveModalOpen(true);
              }}
              className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              Leave Group
            </button>
          </div>
        )}

        {/* Creator Control: Find More Travelers toggle */}
        {isCreator && (
          <div className="mt-5 rounded-lg border border-line bg-paper p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Find More Travelers</p>
              <p className="text-[11px] text-muted">
                {isFull
                  ? "Group has reached maximum capacity. Recruiting automatically closed."
                  : group.recruiting
                  ? "Your group is visible in Explore for compatible travelers to find and request to join."
                  : "Recruiting is OFF. This group is hidden from Explore recruiting results."}
              </p>
            </div>

            <button
              type="button"
              disabled={isFull}
              onClick={() => toggleGroupRecruiting(group.id)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                isFull
                  ? "bg-sand text-muted cursor-not-allowed"
                  : group.recruiting
                  ? "bg-forest text-white hover:bg-forest/90"
                  : "border border-line bg-card text-ink hover:bg-sand"
              }`}
            >
              {isFull ? "Group Full (OFF)" : group.recruiting ? "Recruiting: ON" : "Recruiting: OFF"}
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-4 border-t border-line">
          <Link
            href={`/app/messages/${group.id}`}
            className="rounded-lg bg-forest px-4 py-2 text-xs font-medium text-white hover:bg-forest/90 transition-colors"
          >
            Open Group Chat →
          </Link>

          {isCreator && (
            <>
              <Link
                href={`/app/guides?group=${group.id}`}
                className="rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink hover:bg-sand transition-colors"
              >
                {guide ? "Change Guide" : "Find a Guide"}
              </Link>

              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-muted hover:text-ink hover:bg-sand transition-colors"
              >
                {editing ? "Cancel Edit" : "Edit Trip Notes"}
              </button>
            </>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-4 pt-4 border-t border-line space-y-2">
            <textarea
              rows={3}
              className="w-full rounded-lg border border-line bg-paper p-3 text-xs text-ink outline-none focus:border-forest"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                updateTrip(trip.id, { description: desc });
                setEditing(false);
              }}
              className="rounded-lg bg-forest px-4 py-1.5 text-xs font-medium text-white"
            >
              Save Description
            </button>
          </div>
        )}
      </div>

      {/* INCOMING GROUP JOIN REQUESTS */}
      {isCreator && groupRequests.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <h2 className="text-sm font-semibold text-ink">
            Group Join Requests ({groupRequests.length})
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Travelers requesting to join together with their companions. Available slots:{" "}
            <strong className="text-forest">{availableSlots}</strong>.
          </p>

          <div className="mt-4 space-y-3">
            {groupRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-lg border border-line bg-paper p-4 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-ink text-sm">
                      {req.fromUserName}&apos;s Group ({req.travelersCount} travelers)
                    </h3>
                    <p className="text-muted mt-0.5">
                      Destination: {req.destination} • Dates: {req.dates} • Budget: {req.budget}
                    </p>
                    <p className="text-muted">
                      Companions: {req.memberNames.join(", ")}
                    </p>
                  </div>

                  <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-medium text-forest self-start">
                    Needs {req.travelersCount} slots
                  </span>
                </div>

                {req.interests && req.interests.length > 0 && (
                  <p className="text-muted">
                    Interests: <span className="text-ink">{req.interests.join(" • ")}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                  <button
                    onClick={() => handleGroupJoinAction(req.id, false)}
                    className="btn-secondary rounded-lg px-3.5 py-1.5 font-medium hover:text-red-700"
                  >
                    Reject
                  </button>
                  <button
                    disabled={req.travelersCount > availableSlots}
                    onClick={() => handleGroupJoinAction(req.id, true)}
                    className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs"
                  >
                    {req.travelersCount > availableSlots ? "Exceeds Slots" : "Accept Group"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SINGLE JOIN REQUESTS */}
      {isCreator && singleRequests.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <h2 className="text-sm font-semibold text-ink">
            Individual Join Requests ({singleRequests.length})
          </h2>

          <div className="mt-3 divide-y divide-line">
            {singleRequests.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} photo={u.profilePhoto} size="sm" />
                  <div>
                    <Link
                      href={`/app/travelers/${u.id}`}
                      className="text-xs font-medium text-ink hover:underline"
                    >
                      {u.name}
                    </Link>
                    <p className="text-[11px] text-muted">{u.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSingleJoinAction(u.id, false)}
                    className="btn-secondary rounded-lg px-3 py-1 text-xs text-muted hover:text-red-700"
                  >
                    Decline
                  </button>
                  <button
                    disabled={isFull}
                    onClick={() => handleSingleJoinAction(u.id, true)}
                    className="btn-primary rounded-lg px-3.5 py-1 text-xs font-medium"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SENT INVITATIONS */}
      {isCreator && groupInvites.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-sm font-semibold text-ink">
              Sent Invitations ({groupInvites.length})
            </h2>
            <span className="text-xs text-muted">
              Travelers invited to this group
            </span>
          </div>

          <div className="mt-3 divide-y divide-line">
            {groupInvites.map((inv) => {
              const targetUserId = inv.toUserId || inv.invitedUserId;
              const traveler = users.find((u) => u.id === targetUserId);
              return (
                <div key={inv.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={traveler?.name || "Traveler"} photo={traveler?.profilePhoto} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-ink">{traveler?.name || "Invited Traveler"}</p>
                      <p className="text-[11px] text-muted">{traveler?.city || "Traveler"}</p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                        inv.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : inv.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-[#e2ede5] text-[#153a25] border border-[#b5d2be]"
                      }`}
                    >
                      {inv.status === "pending" ? "Invitation Sent" : inv.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* GROUP MEMBERS */}
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-sm font-semibold text-ink">Members ({members.length}/{max})</h2>
          <span className="text-xs text-muted">
            {isFull ? "Max limit reached" : `${availableSlots} open slots`}
          </span>
        </div>

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

              <div className="flex items-center gap-2">
                {m.id && m.id.startsWith("u_") && !m.id.includes("companion") && (
                  <Link
                    href={`/app/travelers/${m.id}`}
                    className="text-xs text-forest hover:underline"
                  >
                    Profile
                  </Link>
                )}
                {isCreator && m.id !== trip.creatorId && (
                  <button
                    onClick={() => removeMember(group.id, m.id)}
                    className="text-xs text-red-600 hover:underline ml-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ASSIGNED GUIDE */}
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-ink">Trip Guide</h2>
        {guide ? (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={guide.name} photo={guide.photo} size="md" />
              <div>
                <p className="text-xs font-semibold text-ink">{guide.name}</p>
                <p className="text-[11px] text-muted">
                  📍 {guide.location} • ₹{guide.pricePerDay.toLocaleString("en-IN")}/day
                </p>
              </div>
            </div>
            <Link
              href={`/app/guides/${guide.id}`}
              className="text-xs text-forest hover:underline font-medium"
            >
              Guide Profile
            </Link>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>No guide assigned yet for this trip.</span>
            <Link href={`/app/guides?group=${group.id}`} className="text-forest hover:underline font-medium">
              Browse Guides →
            </Link>
          </div>
        )}
      </section>
      {/* LEAVE GROUP CONFIRMATION MODAL */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Leave Travel Group</h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to leave this group? You will no longer have access to the group chat or member-only coordination.
            </p>
            {isCreator && group.memberIds.length > 1 && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                ⚠️ As group creator, leaving will transfer ownership to another group member.
              </p>
            )}
            {isCreator && group.memberIds.length <= 1 && (
              <p className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                You are the creator and only member. You cannot leave without other members. Manage or cancel the trip instead.
              </p>
            )}
            {leaveError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
                {leaveError}
              </p>
            )}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="btn-secondary rounded-lg px-3.5 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCreator && group.memberIds.length <= 1}
                onClick={handleLeaveGroup}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors"
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
