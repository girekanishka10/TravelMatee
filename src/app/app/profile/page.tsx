"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ageFromDob } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";

export default function ProfilePage() {
  const { currentUser, currentGuide, logout, updateProfile } = useApp();
  const router = useRouter();

  const [bio, setBio] = useState(currentUser?.bio ?? currentGuide?.bio ?? "");
  const [emergencyName, setEmergencyName] = useState(currentUser?.emergencyContact?.name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyContact?.phone ?? "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentUser && !currentGuide) return null;

  const isGuide = Boolean(currentGuide && !currentUser);
  const displayName = isGuide ? currentGuide?.name : currentUser?.name;
  const displayLocation = isGuide ? currentGuide?.location : currentUser?.city;
  const avatarUrl = isGuide ? currentGuide?.photo : currentUser?.profilePhoto;
  const p = currentUser?.travelPersonality;

  function handleSave() {
    if (currentUser) {
      updateProfile({
        bio,
        emergencyContact: { name: emergencyName, phone: emergencyPhone },
      });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-8">
      {/* Profile Header */}
      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar name={displayName || "User"} photo={avatarUrl} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-ink">{displayName}</h1>
              <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                {isGuide ? "Guide Account" : "Traveler Account"}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {currentUser && `${ageFromDob(currentUser.dateOfBirth)} yrs • `}📍 {displayLocation}
            </p>
            {p && (
              <p className="text-xs font-medium text-ink mt-1">
                {p.title}
              </p>
            )}
          </div>
        </div>

        {p && (
          <div className="mt-5 pt-4 border-t border-line space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Lifestyle Trait Breakdown</p>
            {Object.entries(p.scores).map(([k, v]) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-xs capitalize text-ink">
                  <span>{k}</span>
                  <span className="font-medium">{v}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-sand">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Edit Form */}
      <div className="mt-6 rounded-xl border border-line bg-card p-6 space-y-3.5 text-xs">
        <h2 className="text-sm font-semibold text-ink">Edit Details</h2>

        <div>
          <label className="block text-muted font-medium">Bio / Introduction</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-paper p-3 text-ink outline-none focus:border-forest"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {!isGuide && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-muted font-medium">Emergency Contact Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-muted font-medium">Emergency Contact Phone</label>
              <input
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-forest font-medium">✓ Profile saved successfully</span>
          ) : (
            <span />
          )}
          <button
            onClick={handleSave}
            className="btn-primary rounded-lg px-4 py-2 font-semibold text-xs"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Navigation / Actions */}
      <div className="mt-6 space-y-2">
        {!isGuide && (
          <Link
            href="/quiz"
            className="block rounded-lg border border-line bg-card p-3 text-center text-xs font-medium text-ink hover:bg-sand transition-colors"
          >
            Retake 15-Question Compatibility Test
          </Link>
        )}
        <Link
          href="/app/safety"
          className="block rounded-lg border border-line bg-card p-3 text-center text-xs font-medium text-ink hover:bg-sand transition-colors"
        >
          Safety Center
        </Link>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full rounded-lg border border-line bg-card p-3 text-center text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
