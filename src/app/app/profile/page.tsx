"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser && !currentGuide) return null;

  const isGuide = Boolean(currentGuide && !currentUser);
  const displayName = isGuide ? currentGuide?.name : currentUser?.name;
  const displayLocation = isGuide ? currentGuide?.location : currentUser?.city;
  const avatarUrl = isGuide ? currentGuide?.photo : currentUser?.profilePhoto;
  const p = currentUser?.travelPersonality;

  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setPhotoNotice(null);

    // Validate image format
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please select a valid image format (JPG, PNG, or WebP).");
      return;
    }

    // Validate image size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize client-side to preserve localStorage quota
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setPhotoError("Could not process photo.");
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

        // Update profile photo
        updateProfile({ profilePhoto: compressedDataUrl });
        setPhotoNotice("Profile photo updated successfully!");
        setTimeout(() => setPhotoNotice(null), 3500);
      };
      img.onerror = () => {
        setPhotoError("Failed to read image file.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setPhotoError("Failed to read file.");
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file could be selected again if needed
    e.target.value = "";
  }

  function handleDeletePhoto() {
    updateProfile({ profilePhoto: "" });
    setPhotoError(null);
    setPhotoNotice("Profile photo removed. Restored initials avatar.");
    setTimeout(() => setPhotoNotice(null), 3500);
  }

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
      <div className="mt-6 rounded-xl border border-line bg-card p-6 space-y-4 text-xs">
        <h2 className="text-sm font-semibold text-ink">Edit Details</h2>

        {/* Profile Photo Upload / Change / Delete Controls */}
        <div className="rounded-lg border border-line bg-paper p-4">
          <label className="block text-muted font-medium mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <Avatar name={displayName || "User"} photo={avatarUrl} size="lg" />
            <div className="flex-1 space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoFileChange}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
                >
                  {avatarUrl && avatarUrl.trim().length > 0 ? "Change Photo" : "Upload Photo"}
                </button>
                {avatarUrl && avatarUrl.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted">
                Accepts JPG, PNG, or WebP. Initials avatar is automatically restored if photo is deleted.
              </p>
            </div>
          </div>

          {photoError && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md">
              {photoError}
            </p>
          )}
          {photoNotice && (
            <p className="mt-2 text-xs text-forest bg-forest/10 p-2 rounded-md font-medium">
              ✓ {photoNotice}
            </p>
          )}
        </div>

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
