"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACTIVITY_OPTIONS } from "@/lib/quiz";
import { useApp } from "@/lib/store";
import type { User } from "@/lib/types";
import { Avatar } from "@/components/Ui";

export default function CreateGroupPage() {
  const { createTrip, recommendedTravelers, currentUser, inviteTraveler } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<"details" | "travelers">("details");

  const [form, setForm] = useState({
    destination: "Manali",
    startingLocation: currentUser?.city ?? "Pune",
    startDate: "2026-11-15",
    endDate: "2026-11-20",
    budgetMin: 12000,
    budgetMax: 15000,
    groupSize: 5,
    travelStyle: "adventure",
    accommodation: "hostel",
    description: "Looking for compatible travel companions for scenic day hikes, cafe exploration, and relaxed evening conversations.",
    activities: ["trekking", "photography", "camping"] as string[],
  });

  const [invitedTravelerIds, setInvitedTravelerIds] = useState<string[]>([]);
  const [profileModalUser, setProfileModalUser] = useState<User | null>(null);

  const travelers = recommendedTravelers();

  function toggleActivity(id: string) {
    setForm((f) => ({
      ...f,
      activities: f.activities.includes(id)
        ? f.activities.filter((x) => x !== id)
        : [...f.activities, id],
    }));
  }

  function handleInviteTraveler(userId: string) {
    if (invitedTravelerIds.includes(userId)) return;
    setInvitedTravelerIds((prev) => [...prev, userId]);
  }

  function handleDone() {
    const creatorId = currentUser?.id || "u_guest";
    const { group } = createTrip({
      ...form,
      initialMembers: [creatorId],
    });

    // Send invitations to all invited travelers
    invitedTravelerIds.forEach((userId) => {
      inviteTraveler(group.id, userId);
    });

    // Stops showing more profiles, creates group, and immediately shows the created group!
    router.push(`/app/trips/${group.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Create Your Own Group</h1>
        <p className="mt-1 text-sm text-muted">
          {step === "details"
            ? "Enter your trip details to form your travel group."
            : "Select compatible travelers to invite into your group."}
        </p>
      </div>

      {step === "details" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("travelers");
          }}
          className="mt-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Destination</label>
              <input
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Starting Location</label>
              <input
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.startingLocation}
                onChange={(e) => setForm({ ...form, startingLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Start Date</label>
              <input
                type="date"
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">End Date</label>
              <input
                type="date"
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Min Budget (₹)</label>
              <input
                type="number"
                step={500}
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Max Budget (₹)</label>
              <input
                type="number"
                step={500}
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Maximum Group Size</label>
              <input
                type="number"
                min={2}
                max={15}
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.groupSize}
                onChange={(e) => setForm({ ...form, groupSize: Number(e.target.value) })}
              />
              <span className="text-[11px] text-muted">e.g. 5 people maximum</span>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Travel Style</label>
              <select
                className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={form.travelStyle}
                onChange={(e) => setForm({ ...form, travelStyle: e.target.value })}
              >
                <option value="adventure">Adventure</option>
                <option value="relaxing">Relaxing</option>
                <option value="cultural">Cultural</option>
                <option value="nature">Nature</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">Activities</label>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_OPTIONS.map((a) => {
                const active = form.activities.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleActivity(a.id)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      active ? "btn-primary font-semibold" : "bg-sand text-ink hover:bg-sand/80"
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Trip Description</label>
            <textarea
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            Continue to Choose Travelers →
          </button>
        </form>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Summary bar */}
          <div className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">Forming Group for:</p>
              <h2 className="text-base font-bold text-ink">
                {form.destination} ({form.startDate} → {form.endDate})
              </h2>
              <p className="text-xs text-muted">
                Invited: <strong className="text-forest">{invitedTravelerIds.length}</strong> travelers (Max capacity: {form.groupSize})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="btn-secondary rounded-lg px-3.5 py-2 text-xs font-medium"
              >
                Edit Trip Details
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="btn-primary rounded-lg px-5 py-2 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>

          <p className="text-xs text-muted">
            Browse suitable travelers and invite them to your group. When finished, tap <strong>Done</strong> to finalize and view your created group.
          </p>

          {/* Traveler Cards List */}
          <div className="space-y-3">
            {travelers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No travelers found. Tap <strong>Done</strong> to finalize and create your group.
              </div>
            ) : (
              travelers.map(({ user, score }) => {
                const isInvited = invitedTravelerIds.includes(user.id);
                const budgetText = user.compatibilityAnswers?.budget
                  ? `${user.compatibilityAnswers.budget}`
                  : "₹12k–15k";

                return (
                  <article
                    key={user.id}
                    className={`rounded-xl border p-4 bg-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                      isInvited ? "border-[#b5d2be] bg-[#f7faf8]" : "border-line"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <Avatar name={user.name} photo={user.profilePhoto} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink">{user.name}</h3>
                        <span className="text-xs text-muted">• {user.city}</span>
                        <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                          {score.overall}% match
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Style: <span className="capitalize">{user.travelPersonality?.title || "Explorer"}</span> • Budget: {budgetText}
                      </p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{user.bio}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setProfileModalUser(user)}
                      className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInviteTraveler(user.id)}
                      disabled={isInvited}
                      className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                        isInvited
                          ? "bg-sand/40 text-muted border border-line cursor-default"
                          : "btn-primary"
                      }`}
                    >
                      {isInvited ? "Invitation Sent" : "Invite"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

          <div className="pt-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-muted">
              {invitedTravelerIds.length} traveler{invitedTravelerIds.length === 1 ? "" : "s"} invited
            </span>
            <button
              type="button"
              onClick={handleDone}
              className="btn-primary rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              Done — Create Group
            </button>
          </div>
        </div>
      )}

      {/* TRAVELER PROFILE MODAL */}
      {profileModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-line bg-card p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <Avatar name={profileModalUser.name} photo={profileModalUser.profilePhoto} size="md" />
                <div>
                  <h3 className="text-base font-bold text-ink">{profileModalUser.name}</h3>
                  <p className="text-xs text-muted">{profileModalUser.city}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalUser(null)}
                className="text-xs text-muted hover:text-ink p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-ink">Bio</p>
                <p className="text-muted mt-0.5 leading-relaxed">{profileModalUser.bio || "No bio entered."}</p>
              </div>

              <div>
                <p className="font-semibold text-ink">Travel Style</p>
                <p className="text-muted mt-0.5">{profileModalUser.travelPersonality?.title || "Balanced Explorer"}</p>
              </div>

              <div>
                <p className="font-semibold text-ink">Travel Experience</p>
                <p className="text-muted mt-0.5">
                  ★ {profileModalUser.rating || "New"} rating • {profileModalUser.completedTripCount} completed trips
                </p>
              </div>

              {profileModalUser.previousTrips && profileModalUser.previousTrips.length > 0 && (
                <div>
                  <p className="font-semibold text-ink">Past Trips</p>
                  <ul className="mt-1 space-y-1 text-muted">
                    {profileModalUser.previousTrips.map((pt) => (
                      <li key={pt.id}>• {pt.destination} ({pt.month})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-line">
              <button
                onClick={() => setProfileModalUser(null)}
                className="btn-secondary rounded-lg px-4 py-1.5 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleInviteTraveler(profileModalUser.id);
                  setProfileModalUser(null);
                }}
                disabled={invitedTravelerIds.includes(profileModalUser.id)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold ${
                  invitedTravelerIds.includes(profileModalUser.id)
                    ? "bg-sand/40 text-muted border border-line cursor-default"
                    : "btn-primary"
                }`}
              >
                {invitedTravelerIds.includes(profileModalUser.id) ? "Invitation Sent" : "Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
