"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar, FemaleTag } from "@/components/Ui";

export default function FindPeoplePage() {
  const { users, currentUser, compatibilityWith, groups, inviteTraveler, invitations, getDmConversationId } = useApp();
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minMatch, setMinMatch] = useState(0);
  const [inviteModalUser, setInviteModalUser] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  // Groups created by currentUser that have available space
  const myGroups = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter((g) => g.creatorId === currentUser.id && g.recruiting);
  }, [groups, currentUser]);

  // Exclude current user from search list
  const travelersList = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUser?.id)
      .map((u) => {
        const score = compatibilityWith(u.id);
        const interests = u.compatibilityAnswers?.q3_activities?.length
          ? u.compatibilityAnswers.q3_activities.join(" • ")
          : u.travelPersonality?.title || "Explorer";

        return {
          user: u,
          score: score?.overall ?? 75,
          highlights: score?.highlights ?? [],
          interests,
        };
      });
  }, [users, currentUser, compatibilityWith]);

  const filtered = useMemo(() => {
    return travelersList.filter(({ user, score }) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (user.name || "").toLowerCase().includes(q);
        const matchCity = (user.city || "").toLowerCase().includes(q);
        const matchBio = (user.bio || "").toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchBio) return false;
      }
      if (selectedCity !== "all" && (user.city || "").toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (minMatch > 0 && score < minMatch) {
        return false;
      }
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [travelersList, search, selectedCity, minMatch]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(travelersList.map((t) => t.user.city).filter(Boolean)));
  }, [travelersList]);

  function handleSendInvite(groupId: string, targetUserId: string) {
    const res = inviteTraveler(groupId, targetUserId);
    setInviteNotice(res.message);
    setTimeout(() => {
      setInviteNotice(null);
      setInviteModalUser(null);
    }, 2000);
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Find People</h1>
        <p className="mt-1 text-sm text-muted">
          Search travelers by name or city to discover compatible travel companions.
        </p>
      </div>

      {/* Notice Banner */}
      {inviteNotice && (
        <div className="mt-4 rounded-lg bg-[#eef5f0] border border-[#b5d2be] px-4 py-2.5 text-xs text-[#153a25] font-medium">
          {inviteNotice}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mt-6 space-y-3 rounded-xl border border-line bg-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, city, or interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-forest"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none"
            >
              <option value="all">All Locations</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none"
            >
              <option value="0">Any Match %</option>
              <option value="80">80%+ Match</option>
              <option value="85">85%+ Match</option>
              <option value="90">90%+ Match</option>
            </select>
          </div>
        </div>

        {(search || selectedCity !== "all" || minMatch > 0) && (
          <div className="flex items-center justify-between text-xs text-muted pt-1">
            <span>
              Showing {filtered.length} traveler{filtered.length === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCity("all");
                setMinMatch(0);
              }}
              className="text-muted hover:text-ink hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Travelers List */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
            {search || selectedCity !== "all" || minMatch > 0
              ? "No travelers found matching your search filters."
              : "No travelers found."}
          </div>
        ) : (
          filtered.map(({ user, score, highlights, interests }) => {
            return (
              <article
                key={user.id}
                className="rounded-xl border border-line bg-card p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar name={user.name} photo={user.profilePhoto} size="md" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-ink">{user.name}</h2>
                      {user.gender === "female" && <FemaleTag />}
                      <span className="text-xs text-muted">• {user.city}</span>
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                        {score}% compatible
                      </span>
                    </div>

                    <p className="text-xs text-muted mt-1">
                      {interests}
                    </p>

                    {highlights.length > 0 && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {highlights.slice(0, 2).map((h) => (
                          <span
                            key={h}
                            className="rounded bg-sand/40 border border-line/60 px-1.5 py-0.5 text-[10px] text-muted"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-1 text-xs text-muted line-clamp-1 max-w-xl">
                      {user.bio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {currentUser && (
                    <Link
                      href={`/app/messages/${getDmConversationId(currentUser.id, user.id)}`}
                      className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      Message
                    </Link>
                  )}

                  <Link
                    href={`/app/travelers/${user.id}`}
                    className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs"
                  >
                    View Profile
                  </Link>

                  {myGroups.length > 0 && (
                    <button
                      onClick={() => setInviteModalUser(user.id)}
                      className="btn-primary rounded-lg px-3.5 py-1.5 text-xs"
                    >
                      Invite
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Quick Invite Modal */}
      {inviteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-line bg-card p-5">
            <h3 className="font-serif text-lg font-bold text-ink">Invite to Your Group</h3>
            <p className="text-xs text-muted mt-1">
              Select which of your open trips you want to invite this traveler to:
            </p>

            <div className="mt-4 space-y-2">
              {myGroups.map((grp) => {
                const isAlreadyInvited = (invitations || []).some(
                  (i) => i.groupId === grp.id && (i.toUserId === inviteModalUser || i.invitedUserId === inviteModalUser) && i.status === "pending"
                );
                const isMember = grp.memberIds.includes(inviteModalUser);

                return (
                  <div
                    key={grp.id}
                    className="flex items-center justify-between rounded-lg border border-line p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-ink">{grp.tripId.replace("t_", "").toUpperCase()} Trip</p>
                      <p className="text-muted text-[11px] mt-0.5">
                        {grp.memberIds.length} members
                      </p>
                    </div>

                    <button
                      disabled={isAlreadyInvited || isMember}
                      onClick={() => handleSendInvite(grp.id, inviteModalUser)}
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
                onClick={() => setInviteModalUser(null)}
                className="btn-secondary rounded-lg px-4 py-1.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
