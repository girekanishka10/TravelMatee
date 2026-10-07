"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Breakdown } from "@/components/Compatibility";
import { ageFromDob } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

export default function TravelerProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { users, reviews, currentUser, compatibilityWith, blockUser, reportUser, groups, inviteTraveler, invitations } = useApp();

  const user = users.find((u) => u.id === userId);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("Inappropriate behavior");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const myGroups = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter((g) => g.creatorId === currentUser.id && g.recruiting);
  }, [groups, currentUser]);

  if (!user) return <main className="p-8 text-center text-sm text-muted">Traveler not found.</main>;

  const score = currentUser && currentUser.id !== user.id ? compatibilityWith(user.id) : null;
  const userReviews = reviews.filter((r) => r.reviewedUserId === user.id && !r.isGuideReview && r.verifiedTrip);
  const avg =
    userReviews.length > 0
      ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1)
      : user.rating
      ? user.rating.toFixed(1)
      : "New";

  function handleSendInvite(groupId: string) {
    if (!user) return;
    const res = inviteTraveler(groupId, user.id);
    setInviteNotice(res.message);
    setTimeout(() => {
      setInviteNotice(null);
      setInviteModalOpen(false);
    }, 2000);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/app/people" className="text-xs text-muted hover:text-ink mb-4 inline-block">
        ← Back to Search Travelers
      </Link>

      {/* Main Profile Card */}
      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
                  <Avatar name={user.name} photo={user.profilePhoto} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-ink">{user.name}</h1>
                {user.verificationStatus === "verified" && (
                  <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {ageFromDob(user.dateOfBirth)} yrs • 📍 {user.city}
              </p>
              <p className="text-xs text-muted">
                ★ {avg} rating • {user.completedTripCount} completed trips
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className="rounded-lg bg-sand px-3 py-1 text-xs font-semibold text-ink">
              {user.travelPersonality?.title || "Explorer"}
            </span>
            {currentUser && currentUser.id !== user.id && myGroups.length > 0 && (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                Invite to Group
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5 pt-4 border-t border-line text-xs">
          <h2 className="font-semibold text-ink mb-1">About</h2>
          <p className="text-muted leading-relaxed">{user.bio || "No bio entered yet."}</p>
        </div>

        {/* Travel Interests & Style */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Travel Style</span>
            <span className="font-medium text-ink mt-0.5 block capitalize">
              {user.compatibilityAnswers?.q2_idealTrip || user.compatibilityAnswers?.idealTrip || user.compatibilityAnswers?.tripType || user.travelPersonality?.title || "Balanced"}
            </span>
          </div>
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Interests & Activities</span>
            <span className="font-medium text-ink mt-0.5 block">
              {(user.compatibilityAnswers?.q3_activities || user.compatibilityAnswers?.activities || []).join(", ") || "Hiking, Sightseeing, Photography"}
            </span>
          </div>
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Preferred Budget</span>
            <span className="font-medium text-ink mt-0.5 block capitalize">
              {user.compatibilityAnswers?.q4_budget || user.compatibilityAnswers?.budget || "Moderate"}
            </span>
          </div>
          <div className="rounded-lg bg-paper p-3 border border-line">
            <span className="text-muted block">Preferred Pace & Companion</span>
            <span className="font-medium text-ink mt-0.5 block capitalize">
              {user.compatibilityAnswers?.q5_pace || "Balanced pace"} • {user.compatibilityAnswers?.q15_companionStyle || "Easy-going"}
            </span>
          </div>
        </div>
      </div>

      {/* Compatibility Section */}
      {score && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <Breakdown score={score} />
        </section>
      )}

      {/* Past Trips Experience */}
      {user.previousTrips && user.previousTrips.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-card p-5">
          <h2 className="text-sm font-semibold text-ink">Past Travel Experience</h2>
          <div className="mt-3 space-y-3">
            {user.previousTrips.map((pt) => (
              <div key={pt.id} className="rounded-lg border border-line bg-paper p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{pt.destination}</span>
                  <span className="text-muted">{pt.month}</span>
                </div>
                <p className="text-muted mt-1 leading-relaxed">{pt.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verified Reviews */}
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-ink">Trip Reviews ({userReviews.length})</h2>
        {userReviews.length === 0 ? (
          <p className="mt-2 text-xs text-muted">No trip reviews yet.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {userReviews.map((r) => {
              const reviewer = users.find((u) => u.id === r.reviewerId);
              return (
                <div key={r.id} className="rounded-lg border border-line bg-paper p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{reviewer?.name || "Travel Companion"}</span>
                    <span className="text-amber-700 font-medium">★ {r.rating}</span>
                  </div>
                  <p className="mt-1 text-muted">{r.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Report / Block Actions */}
      {currentUser && currentUser.id !== user.id && (
        <div className="mt-6 flex items-center justify-end gap-3 text-xs">
          <button
            onClick={() => setReportOpen(true)}
            className="text-muted hover:text-red-700 underline"
          >
            Report Profile
          </button>
          <span>•</span>
          <button
            onClick={() => {
              blockUser(user.id);
              alert("User blocked.");
            }}
            className="text-muted hover:text-red-700 underline"
          >
            Block
          </button>
        </div>
      )}

      {/* Invite to Group Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-line bg-card p-5">
            <h3 className="font-serif text-lg font-bold text-ink">Invite {user.name}</h3>
            <p className="text-xs text-muted mt-1">
              Select which of your active groups you want to invite them to:
            </p>

            {inviteNotice && (
              <div className="mt-3 rounded-lg bg-[#eef5f0] border border-[#b5d2be] px-3.5 py-2 text-xs text-[#153a25] font-medium">
                {inviteNotice}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {myGroups.map((grp) => {
                const isAlreadyInvited = (invitations || []).some(
                  (i) => i.groupId === grp.id && (i.toUserId === user.id || i.invitedUserId === user.id) && i.status === "pending"
                );
                const isMember = grp.memberIds.includes(user.id);

                return (
                  <div
                    key={grp.id}
                    className="flex items-center justify-between rounded-lg border border-line p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-ink">{grp.tripId.replace("t_", "").toUpperCase()} Group</p>
                      <p className="text-muted text-[11px] mt-0.5">
                        {grp.memberIds.length} members
                      </p>
                    </div>

                    <button
                      disabled={isAlreadyInvited || isMember}
                      onClick={() => handleSendInvite(grp.id)}
                      className={`rounded-lg px-3 py-1.5 font-semibold text-xs ${
                        isMember
                          ? "bg-sand text-muted cursor-default"
                          : isAlreadyInvited
                          ? "bg-sand text-muted cursor-default"
                          : "btn-primary"
                      }`}
                    >
                      {isMember ? "Already Member" : isAlreadyInvited ? "Invitation Sent" : "Send Invite"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="btn-secondary rounded-lg px-4 py-1.5 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5 text-xs">
            <h3 className="font-bold text-sm text-ink mb-2">Report Traveler</h3>
            <p className="text-muted mb-3">Help maintain a safe and respectful community.</p>

            {reportSuccess ? (
              <div>
                <p className="text-forest font-semibold mb-3">Report submitted. Thank you.</p>
                <button
                  onClick={() => {
                    setReportOpen(false);
                    setReportSuccess(false);
                  }}
                  className="btn-primary w-full rounded-lg py-2 font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded border border-line bg-paper p-2 text-ink"
                >
                  <option>Inappropriate behavior</option>
                  <option>Safety concern</option>
                  <option>Spam or commercial advertising</option>
                  <option>Misleading profile information</option>
                </select>

                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                  <button
                    onClick={() => setReportOpen(false)}
                    className="btn-secondary rounded-lg px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      reportUser(user.id, reason);
                      setReportSuccess(true);
                    }}
                    className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
