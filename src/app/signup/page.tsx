"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";

function SignupContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "guide" ? "guide" : "traveler";
  const [role, setRole] = useState<"traveler" | "guide">(initialRole);

  const { signup, signupAsGuide } = useApp();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Traveler form
  const [travelerForm, setTravelerForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "prefer-not-to-say" as Gender,
    mobile: "",
    email: "",
    city: "",
    password: "",
  });

  // Guide form
  const [guideForm, setGuideForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    location: "",
    experienceYears: 4,
    languages: "English, Hindi",
    specialties: "Trekking, Local culture",
    destinations: "Manali, Kasol",
    pricePerDay: 1800,
    bio: "",
    photo: "",
  });

  function onTravelerSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const err = signup({
      ...travelerForm,
      profilePhoto: "",
    });
    if (err) {
      setError(err);
      return;
    }
    router.push("/verify");
  }

  function onGuideSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const err = signupAsGuide({
      name: guideForm.name,
      email: guideForm.email,
      mobile: guideForm.mobile,
      password: guideForm.password,
      location: guideForm.location,
      experienceYears: Number(guideForm.experienceYears),
      languages: guideForm.languages.split(",").map((s) => s.trim()).filter(Boolean),
      specialties: guideForm.specialties.split(",").map((s) => s.trim()).filter(Boolean),
      destinations: guideForm.destinations.split(",").map((s) => s.trim()).filter(Boolean),
      pricePerDay: Number(guideForm.pricePerDay),
      bio: guideForm.bio,
      photo: guideForm.photo,
      areasCovered: [guideForm.location],
      availability: "Available for upcoming bookings",
      certifications: ["Certified Local Guide"],
      photos: [],
      verificationStatus: "verified",
    });
    if (err) {
      setError(err);
      return;
    }
    router.push("/app/guide-dashboard");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link href="/" className="text-xs text-muted hover:text-ink mb-6 inline-flex items-center gap-1">
        ← Back to home
      </Link>

      <div className="flex border-b border-line mb-6">
        <button
          type="button"
          onClick={() => {
            setRole("traveler");
            setError(null);
          }}
          className={`pb-3 text-sm font-medium border-b-2 mr-6 transition-colors ${
            role === "traveler"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Traveler Registration
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("guide");
            setError(null);
          }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            role === "guide"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Register as Guide
        </button>
      </div>

      <h1 className="font-serif text-3xl font-bold text-ink">
        {role === "guide" ? "Local Guide Registration" : "Create Traveler Account"}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {role === "guide"
          ? "List your expertise, rates, and regional specialties to receive direct trip requests."
          : "Sign up to take the 15-question compatibility test and discover travel groups."}
      </p>

      {role === "traveler" ? (
        <form onSubmit={onTravelerSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={travelerForm.name}
              onChange={(e) => setTravelerForm({ ...travelerForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Date of Birth</label>
              <input
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={travelerForm.dateOfBirth}
                onChange={(e) => setTravelerForm({ ...travelerForm, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Gender</label>
              <select
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={travelerForm.gender}
                onChange={(e) => setTravelerForm({ ...travelerForm, gender: e.target.value as Gender })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Mobile Number</label>
              <input
                type="tel"
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={travelerForm.mobile}
                onChange={(e) => setTravelerForm({ ...travelerForm, mobile: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">City</label>
              <input
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={travelerForm.city}
                onChange={(e) => setTravelerForm({ ...travelerForm, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={travelerForm.email}
              onChange={(e) => setTravelerForm({ ...travelerForm, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={travelerForm.password}
              onChange={(e) => setTravelerForm({ ...travelerForm, password: e.target.value })}
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            Continue to Identity Verification
          </button>
        </form>
      ) : (
        <form onSubmit={onGuideSubmit} className="mt-6 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Guide Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.name}
                onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Base Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Manali, Himachal"
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.location}
                onChange={(e) => setGuideForm({ ...guideForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.email}
                onChange={(e) => setGuideForm({ ...guideForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Mobile</label>
              <input
                type="tel"
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.mobile}
                onChange={(e) => setGuideForm({ ...guideForm, mobile: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={guideForm.password}
              onChange={(e) => setGuideForm({ ...guideForm, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Languages</label>
              <input
                type="text"
                placeholder="English, Hindi, Garhwali"
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.languages}
                onChange={(e) => setGuideForm({ ...guideForm, languages: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Experience (Years)</label>
              <input
                type="number"
                min={0}
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.experienceYears}
                onChange={(e) => setGuideForm({ ...guideForm, experienceYears: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Specialties</label>
              <input
                type="text"
                placeholder="Trekking, River Rafting"
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.specialties}
                onChange={(e) => setGuideForm({ ...guideForm, specialties: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted">Rate (₹ / Day)</label>
              <input
                type="number"
                min={500}
                required
                className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
                value={guideForm.pricePerDay}
                onChange={(e) => setGuideForm({ ...guideForm, pricePerDay: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Destinations Covered</label>
            <input
              type="text"
              placeholder="e.g. Manali, Kasol, Spiti Valley"
              className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={guideForm.destinations}
              onChange={(e) => setGuideForm({ ...guideForm, destinations: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Short Introduction / Bio</label>
            <textarea
              rows={3}
              placeholder="Tell travelers about your regional expertise and approach to safety..."
              className="mt-1 w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
              value={guideForm.bio}
              onChange={(e) => setGuideForm({ ...guideForm, bio: e.target.value })}
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            Create Guide Profile & Enter Dashboard
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-muted">
        Already registered?{" "}
        <Link href={role === "guide" ? "/login?role=guide" : "/login"} className="text-forest font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading signup...</div>}>
      <SignupContent />
    </Suspense>
  );
}
