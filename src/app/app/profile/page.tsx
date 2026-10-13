"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ageFromDob } from "@/lib/format";
import { useApp } from "@/lib/store";
import { CompatibilityAnswers } from "@/lib/types";
import { Avatar } from "@/components/Ui";

export default function ProfilePage() {
  const { currentUser, currentGuide, logout, updateProfile, addTravelPhotos, deleteTravelPhoto } = useApp();
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState<string>(currentUser?.name ?? currentGuide?.name ?? "");
  const [city, setCity] = useState<string>(currentUser?.city ?? currentGuide?.location ?? "");
  const [bio, setBio] = useState<string>(currentUser?.bio ?? currentGuide?.bio ?? "");
  const [travelStyle, setTravelStyle] = useState<string>(
    String(
      currentUser?.compatibilityAnswers?.q2_idealTrip ||
        currentUser?.compatibilityAnswers?.idealTrip ||
        currentUser?.travelPersonality?.title ||
        "Balanced exploration"
    )
  );
  const [budget, setBudget] = useState<string>(
    String(currentUser?.compatibilityAnswers?.q4_budget || currentUser?.compatibilityAnswers?.budget || "Moderate")
  );
  const [interests, setInterests] = useState<string>(
    (
      currentUser?.compatibilityAnswers?.q3_activities ||
      currentUser?.compatibilityAnswers?.activities || ["Hiking", "Sightseeing", "Photography"]
    ).join(", ")
  );
  const [emergencyName, setEmergencyName] = useState<string>(currentUser?.emergencyContact?.name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState<string>(currentUser?.emergencyContact?.phone ?? "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile photo state
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Travel trip photos state
  const tripFileInputRef = useRef<HTMLInputElement>(null);
  const [tripPhotoError, setTripPhotoError] = useState<string | null>(null);
  const [tripPhotoNotice, setTripPhotoNotice] = useState<string | null>(null);
  const [pendingTripFiles, setPendingTripFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [tripDestination, setTripDestination] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [tripCaption, setTripCaption] = useState("");
  const [isUploadingTripPhotos, setIsUploadingTripPhotos] = useState(false);

  // Synchronize state when the active user changes (e.g. logging into another account)
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setCity(currentUser.city || "");
      setBio(currentUser.bio || "");
      setTravelStyle(
        String(
          currentUser.compatibilityAnswers?.q2_idealTrip ||
            currentUser.compatibilityAnswers?.idealTrip ||
            currentUser.travelPersonality?.title ||
            "Balanced exploration"
        )
      );
      setBudget(
        String(
          currentUser.compatibilityAnswers?.q4_budget || currentUser.compatibilityAnswers?.budget || "Moderate"
        )
      );
      const acts =
        currentUser.compatibilityAnswers?.q3_activities || currentUser.compatibilityAnswers?.activities || [];
      setInterests(acts.length > 0 ? acts.join(", ") : "Hiking, Sightseeing, Photography");
      setEmergencyName(currentUser.emergencyContact?.name || "");
      setEmergencyPhone(currentUser.emergencyContact?.phone || "");
    } else if (currentGuide) {
      setName(currentGuide.name || "");
      setCity(currentGuide.location || "");
      setBio(currentGuide.bio || "");
    }
  }, [currentUser, currentGuide]);

  if (!currentUser && !currentGuide) return null;

  const isGuide = Boolean(currentGuide && !currentUser);
  const displayName = isGuide ? currentGuide?.name : currentUser?.name;
  const displayLocation = isGuide ? currentGuide?.location : currentUser?.city;
  const avatarUrl = isGuide ? currentGuide?.photo : currentUser?.profilePhoto;
  const p = currentUser?.travelPersonality;
  const userTripPhotos = currentUser?.travelPhotos || [];

  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setPhotoNotice(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please select a valid image format (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
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

        updateProfile({ profilePhoto: compressedDataUrl });
        setPhotoNotice("Profile photo updated successfully!");
        setTimeout(() => setPhotoNotice(null), 3500);
      };
      img.onerror = () => setPhotoError("Failed to read image file.");
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setPhotoError("Failed to read file.");
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  function handleDeletePhoto() {
    updateProfile({ profilePhoto: "" });
    setPhotoError(null);
    setPhotoNotice("Profile photo removed. Restored initials avatar.");
    setTimeout(() => setPhotoNotice(null), 3500);
  }

  // Handle Trip Photos Selection
  function handleTripFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setTripPhotoError(null);
    setTripPhotoNotice(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const validFiles: File[] = [];

    for (const f of files) {
      if (!validTypes.includes(f.type)) {
        setTripPhotoError(`"${f.name}" is not a supported format. Please select JPG, PNG, or WebP files.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setTripPhotoError(`"${f.name}" exceeds 5MB. Please choose smaller photos.`);
        return;
      }
      validFiles.push(f);
    }

    setPendingTripFiles(validFiles);

    // Create object URL previews for the modal
    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setPendingPreviews(previews);

    e.target.value = "";
  }

  function cancelTripUpload() {
    pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPendingPreviews([]);
    setPendingTripFiles([]);
    setTripDestination("");
    setTripDate("");
    setTripCaption("");
    setTripPhotoError(null);
  }

  async function handleConfirmTripUpload() {
    if (pendingTripFiles.length === 0) return;
    setIsUploadingTripPhotos(true);
    setTripPhotoError(null);

    try {
      const processedPhotos: { url: string; caption?: string; destination?: string; tripDate?: string }[] = [];

      for (const file of pendingTripFiles) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              // Resize client-side to max 720px to keep storage compact
              const maxDim = 720;
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
                reject(new Error("Canvas context failed"));
                return;
              }
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            img.onerror = () => reject(new Error("Image failed to load"));
            img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error("File read error"));
          reader.readAsDataURL(file);
        });

        processedPhotos.push({
          url: dataUrl,
          destination: tripDestination.trim() || undefined,
          tripDate: tripDate.trim() || undefined,
          caption: tripCaption.trim() || undefined,
        });
      }

      addTravelPhotos(processedPhotos);
      setTripPhotoNotice(
        `✓ ${processedPhotos.length} travel photo${processedPhotos.length > 1 ? "s" : ""} added to your profile!`
      );
      cancelTripUpload();
      setTimeout(() => setTripPhotoNotice(null), 3500);
    } catch {
      setTripPhotoError("Failed to process trip photos. Please try again with valid images.");
    } finally {
      setIsUploadingTripPhotos(false);
    }
  }

  function handleDeleteTripPhoto(photoId: string) {
    deleteTravelPhoto(photoId);
    setTripPhotoNotice("Photo removed from your travel memories.");
    setTimeout(() => setTripPhotoNotice(null), 3000);
  }

  function handleSave() {
    if (currentUser) {
      const activitiesArray = interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const baseAnswers: CompatibilityAnswers = currentUser.compatibilityAnswers || {
        q1_destination: "mountains",
        q2_idealTrip: travelStyle.trim(),
        q3_activities: ["Hiking", "Sightseeing"],
        q4_budget: budget.trim(),
        q5_pace: "moderate",
        q6_social: "balanced",
        q7_travelWith: "small-group",
        q8_accommodation: "homestay",
        q9_topPriorities: ["scenery", "culture"],
        q10_activeTime: "morning",
        q11_spontaneous: "balanced",
        q12_transit: "shared-cab",
        q13_food: "local-food",
        q14_personalSpace: "comfortable",
        q15_companionStyle: "open-minded",
      };

      const updatedAnswers: CompatibilityAnswers = {
        ...baseAnswers,
        q2_idealTrip: travelStyle.trim(),
        idealTrip: travelStyle.trim(),
        q3_activities: activitiesArray.length > 0 ? activitiesArray : baseAnswers.q3_activities,
        activities: activitiesArray.length > 0 ? activitiesArray : baseAnswers.q3_activities,
        q4_budget: budget.trim(),
      };

      updateProfile({
        name: name.trim() || currentUser.name,
        city: city.trim() || currentUser.city,
        bio: bio.trim(),
        compatibilityAnswers: updatedAnswers,
        emergencyContact: { name: emergencyName.trim(), phone: emergencyPhone.trim() },
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
          <label className="block text-muted font-medium mb-2">Profile Photo (Display Picture)</label>
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

        {/* Name and City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium">Full Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-muted font-medium">Current City / Location</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune, Mumbai, Bangalore"
            />
          </div>
        </div>

        {/* Bio / Introduction */}
        <div>
          <label className="block text-muted font-medium">Bio / Introduction</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-paper p-3 text-ink outline-none focus:border-forest"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce yourself to fellow travelers..."
          />
        </div>

        {/* Traveler Preferences */}
        {!isGuide && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-medium">Travel Style</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  placeholder="e.g. Balanced, Adventure, Relaxed"
                />
              </div>
              <div>
                <label className="block text-muted font-medium">Preferred Budget</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. Moderate, Budget backpacker, Luxury"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted font-medium">Interests & Activities (comma-separated)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. Hiking, Photography, Heritage, Cafes, Beach sunsets"
              />
            </div>

            {/* Emergency Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-line">
              <div>
                <label className="block text-muted font-medium">Emergency Contact Name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Contact person"
                />
              </div>
              <div>
                <label className="block text-muted font-medium">Emergency Contact Phone</label>
                <input
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91..."
                />
              </div>
            </div>
          </>
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

      {/* My Travel Photos / Travel Memories Gallery */}
      {!isGuide && (
        <div className="mt-6 rounded-xl border border-line bg-card p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">My Travel Photos / Travel Memories</h2>
              <p className="text-[11px] text-muted mt-0.5">
                Photos from trips and destinations you have personally visited. Separate from your profile picture.
              </p>
            </div>
            <div>
              <input
                ref={tripFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleTripFilesSelected}
              />
              <button
                type="button"
                onClick={() => tripFileInputRef.current?.click()}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold shrink-0"
              >
                Upload Trip Photos
              </button>
            </div>
          </div>

          {tripPhotoError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
              {tripPhotoError}
            </p>
          )}

          {tripPhotoNotice && (
            <p className="text-xs text-forest bg-forest/10 p-2 rounded-md font-medium">
              {tripPhotoNotice}
            </p>
          )}

          {/* Pending Upload Form Modal / Drawer */}
          {pendingPreviews.length > 0 && (
            <div className="rounded-lg border border-forest/30 bg-forest/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink text-xs">
                  Adding {pendingPreviews.length} Photo{pendingPreviews.length > 1 ? "s" : ""}
                </span>
                <span className="text-[11px] text-muted">Optional details for this trip</span>
              </div>

              {/* Preview thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {pendingPreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="h-16 w-16 rounded-md object-cover border border-line shrink-0"
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-muted font-medium">Destination (optional)</label>
                  <input
                    type="text"
                    className="mt-0.5 w-full rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none focus:border-forest"
                    value={tripDestination}
                    onChange={(e) => setTripDestination(e.target.value)}
                    placeholder="e.g. Manali, Himachal Pradesh"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted font-medium">Trip Date / Season (optional)</label>
                  <input
                    type="text"
                    className="mt-0.5 w-full rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none focus:border-forest"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    placeholder="e.g. Oct 2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted font-medium">Caption (optional)</label>
                <input
                  type="text"
                  className="mt-0.5 w-full rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none focus:border-forest"
                  value={tripCaption}
                  onChange={(e) => setTripCaption(e.target.value)}
                  placeholder="e.g. Beautiful mountain trail with friends"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelTripUpload}
                  className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploadingTripPhotos}
                  onClick={handleConfirmTripUpload}
                  className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold"
                >
                  {isUploadingTripPhotos ? "Processing..." : "Confirm & Save Photos"}
                </button>
              </div>
            </div>
          )}

          {/* Photo Gallery Grid */}
          {userTripPhotos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-6 text-center text-muted">
              <p className="text-xs">No personal trip photos uploaded yet.</p>
              <p className="text-[11px] text-muted/80 mt-1">
                Upload real photos of places you have visited to showcase your travel memories to other travelers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {userTripPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-lg border border-line bg-paper transition-shadow hover:shadow-sm"
                >
                  <div className="aspect-square w-full overflow-hidden bg-sand">
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.destination || "Personal trip photo"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-2 space-y-0.5">
                    {photo.destination && (
                      <p className="font-semibold text-ink text-[11px] truncate">
                        📍 {photo.destination}
                      </p>
                    )}
                    {photo.tripDate && (
                      <p className="text-[10px] text-muted">{photo.tripDate}</p>
                    )}
                    {photo.caption && (
                      <p className="text-[11px] text-muted line-clamp-2">{photo.caption}</p>
                    )}
                    <div className="pt-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTripPhoto(photo.id)}
                        className="text-[10px] font-medium text-red-600 hover:text-red-700 hover:underline"
                      >
                        Delete Photo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
