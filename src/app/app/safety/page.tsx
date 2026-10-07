"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";

export default function SafetyPage() {
  const { currentUser, groups, trips, users } = useApp();
  const [sos, setSos] = useState(false);
  const [shared, setShared] = useState(false);
  if (!currentUser) return null;
  const liveTrips = groups
    .filter((g) => g.memberIds.includes(currentUser.id))
    .map((g) => trips.find((t) => t.id === g.tripId))
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-xl px-5 py-6">
      <h1 className="font-serif text-4xl">Safety</h1>
      <p className="mt-2 text-sm text-muted">
        TravelMate is built for group travel, not dating. Identity badges confirm demo verification only. Sensitive ID
        data is never shown on profiles.
      </p>

      <section className="mt-6 space-y-3">
        <div className="rounded-3xl bg-card p-4 tm-shadow">
          <h2 className="font-medium">Identity verification</h2>
          <p className="text-sm text-muted">Status: {currentUser.verificationStatus === "verified" ? "✓ Verified (badge only)" : "Unverified"}</p>
        </div>
        <div className="rounded-3xl bg-card p-4 tm-shadow">
          <h2 className="font-medium">Verified travel history</h2>
          <p className="text-sm text-muted">{currentUser.completedTripCount} completed trips on record.</p>
        </div>
        <div className="rounded-3xl bg-card p-4 tm-shadow">
          <h2 className="font-medium">Emergency contact</h2>
          <p className="text-sm text-muted">
            {currentUser.emergencyContact
              ? `${currentUser.emergencyContact.name} · ${currentUser.emergencyContact.phone}`
              : "Add one on your profile."}
          </p>
          <Link href="/app/profile" className="text-sm text-forest">
            Update
          </Link>
        </div>
      </section>

      <button
        onClick={() => setSos(true)}
        className="mt-6 w-full rounded-full bg-clay py-4 text-lg font-medium text-white"
      >
        Emergency / SOS
      </button>
      {sos && (
        <p className="mt-3 rounded-2xl bg-sand p-4 text-sm">
          Prototype SOS: in a real product this would alert your emergency contact and share live trip context. Call
          local emergency services immediately if you are in danger.
        </p>
      )}

      <button
        onClick={() => setShared(true)}
        className="mt-3 w-full rounded-full border border-line py-3"
      >
        Share trip details with emergency contact
      </button>
      {shared && liveTrips[0] && (
        <p className="mt-3 text-sm text-muted">
          Shared {liveTrips[0]!.destination} ({liveTrips[0]!.startDate} → {liveTrips[0]!.endDate}) with{" "}
          {currentUser.emergencyContact?.name ?? "your contact"}.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Group safety guidelines</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Meet in public for the first time and tell someone your itinerary.</li>
          <li>Keep group costs transparent; never send deposits to personal accounts you cannot verify.</li>
          <li>Share location in the trip chat on travel days.</li>
          <li>Report and block anyone who makes you uncomfortable — this is a travel platform, not a dating space.</li>
          <li>Verified reviews only appear after a completed shared trip.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Report or block</h2>
        <p className="mt-2 text-sm text-muted">Open a traveller profile to report or block. Blocked people disappear from Explore and discovery.</p>
        <ul className="mt-3 text-sm">
          {currentUser.blockedUserIds.map((id) => {
            const u = users.find((x) => x.id === id);
            return <li key={id}>Blocked: {u?.name ?? id}</li>;
          })}
        </ul>
      </section>
    </main>
  );
}
