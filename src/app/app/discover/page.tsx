"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

function DiscoverInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { groups, trips, currentUser, recommendedTravelers, inviteTraveler } = useApp();

  const groupId = params.get("group") ?? groups.find((g) => g.creatorId === currentUser?.id)?.id;
  const group = groups.find((g) => g.id === groupId);
  const trip = trips.find((t) => t.id === group?.tripId);

  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const candidates = useMemo(() => {
    if (!currentUser || !group) return [];
    return recommendedTravelers().filter(
      (row) => !group.memberIds.includes(row.user.id) && !group.pendingInviteIds.includes(row.user.id)
    );
  }, [currentUser, group, recommendedTravelers]);

  if (!group || !trip) {
    return (
      <main className="mx-auto max-w-md px-6 py-12 text-center text-xs text-muted">
        <p>No active group selected.</p>
        <Link href="/app/create" className="mt-4 inline-block text-forest underline font-medium">
          Create a group first →
        </Link>
      </main>
    );
  }

  function handleInvite(userId: string) {
    inviteTraveler(group!.id, userId);
    setInvitedIds((prev) => [...prev, userId]);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Find Travelers for {trip.destination}</h1>
          <p className="mt-0.5 text-xs text-muted">
            Send invitations to compatible travelers for your trip.
          </p>
        </div>
        <button
          onClick={() => router.push(`/app/trips/${group.id}`)}
          className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
        >
          View Group ({group.memberIds.length}/{trip.groupSize})
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
            No travelers found.
          </div>
        ) : (
          candidates.map(({ user, score }) => {
            const isInvited = invitedIds.includes(user.id);

            return (
              <article
                key={user.id}
                className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar name={user.name} photo={user.profilePhoto} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink">{user.name}</h2>
                      <span className="text-xs text-muted">• {user.city}</span>
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                        {score.overall}% Match
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{user.bio}</p>
                    {score.highlights && score.highlights.length > 0 && (
                      <p className="text-[11px] text-muted mt-0.5">
                        Matched on: {score.highlights.slice(0, 2).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/app/travelers/${user.id}`}
                    className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    disabled={isInvited}
                    onClick={() => handleInvite(user.id)}
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
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading travelers...</div>}>
      <DiscoverInner />
    </Suspense>
  );
}
