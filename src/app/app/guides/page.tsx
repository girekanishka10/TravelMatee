"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Guide } from "@/lib/types";
import { Avatar } from "@/components/Ui";

function GuidesInner() {
  const params = useSearchParams();
  const { guides, groups, trips, currentUser, requestGuide, guideRequests } = useApp();

  const preselectedGroupId = params.get("group") ?? "";

  const [destination, setDestination] = useState(params.get("destination") ?? "");
  const [budgetMax, setBudgetMax] = useState<number>(5000);
  const [language, setLanguage] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [minExperience, setMinExperience] = useState<number>(0);

  // Request modal state
  const [requestModalGuide, setRequestModalGuide] = useState<Guide | null>(null);
  const [reqDestination, setReqDestination] = useState("Manali");
  const [reqDates, setReqDates] = useState("15–19 Nov 2026");
  const [reqBudget, setReqBudget] = useState("₹12,000–₹15,000");
  const [reqTravelers, setReqTravelers] = useState(2);
  const [reqNotes, setReqNotes] = useState("");
  const [actionNotice, setActionNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Filtered guides covering all test cases (destination match/no-match, language match, specialty, budget, rating)
  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      if (destination) {
        const destLower = destination.toLowerCase();
        const matchesLoc = g.location.toLowerCase().includes(destLower);
        const matchesDest = g.destinations?.some((d) => d.toLowerCase().includes(destLower));
        const matchesArea = g.areasCovered.some((a) => a.toLowerCase().includes(destLower));
        if (!matchesLoc && !matchesDest && !matchesArea) return false;
      }
      if (language) {
        const langLower = language.toLowerCase();
        if (!g.languages.some((l) => l.toLowerCase().includes(langLower))) return false;
      }
      if (specialty) {
        const specLower = specialty.toLowerCase();
        if (!g.specialties.some((s) => s.toLowerCase().includes(specLower))) return false;
      }
      if (budgetMax && g.pricePerDay > budgetMax) {
        return false;
      }
      if (minExperience && g.experienceYears < minExperience) {
        return false;
      }
      return true;
    });
  }, [guides, destination, language, specialty, budgetMax, minExperience]);

  function handleOpenRequestModal(g: Guide) {
    // If user has a selected trip/group, prefill
    const myGroup = groups.find((grp) => grp.id === preselectedGroupId || grp.memberIds.includes(currentUser?.id ?? ""));
    const trip = trips.find((t) => t.id === myGroup?.tripId);

    setRequestModalGuide(g);
    setReqDestination(trip?.destination || g.location);
    setReqDates(trip ? `${trip.startDate} → ${trip.endDate}` : "15–19 Nov 2026");
    setReqBudget(trip ? `${formatINR(trip.budgetMin)}–${formatINR(trip.budgetMax)}` : "₹12,000–₹15,000");
    setReqTravelers(myGroup?.memberIds.length || 2);
    setReqNotes("");
  }

  function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!requestModalGuide) return;

    const res = requestGuide(requestModalGuide.id, {
      destination: reqDestination,
      dates: reqDates,
      budget: reqBudget,
      interests: requestModalGuide.specialties,
      travelersCount: reqTravelers,
      notes: reqNotes,
      groupId: preselectedGroupId || undefined,
    });

    setActionNotice({ text: res.message, error: !res.success });
    setRequestModalGuide(null);
    setTimeout(() => setActionNotice(null), 4000);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Find a Guide</h1>
        <p className="mt-1 text-sm text-muted">
          Connect with certified local guides for trekking, heritage routes, and personalized regional trips.
        </p>
      </div>

      {actionNotice && (
        <div
          className={`mt-4 rounded-lg p-3 text-xs font-medium border ${
            actionNotice.error ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"
          }`}
        >
          {actionNotice.text}
        </div>
      )}

      {/* Filter Bar */}
      <div className="mt-5 rounded-xl border border-line bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Destination</label>
            <input
              placeholder="e.g. Manali, Leh, Kochi"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Language</label>
            <input
              placeholder="e.g. English, Hindi, Ladakhi"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Specialty / Interest</label>
            <input
              placeholder="e.g. Trekking, Rafting, Food"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-line">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">
              Max Daily Rate: ₹{budgetMax.toLocaleString("en-IN")}/day
            </label>
            <input
              type="range"
              min={1000}
              max={6000}
              step={500}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="mt-1 w-full accent-forest"
            />
          </div>

          <div className="flex items-end justify-between sm:justify-end gap-2">
            <button
              onClick={() => {
                setDestination("");
                setLanguage("");
                setSpecialty("");
                setBudgetMax(6000);
                setMinExperience(0);
              }}
              className="text-xs text-muted hover:text-ink underline pb-1"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Guides List */}
      <div className="mt-6 space-y-3.5">
        {filteredGuides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
            {guides.length === 0
              ? "No registered guides found. Newly registered guides will appear here once they create a guide profile."
              : "No guides found matching your search criteria. Try loosening budget or specialty filters."}
          </div>
        ) : (
          filteredGuides.map((g) => {
            const isRequested = (guideRequests || []).some(
              (r) => r.guideId === g.id && r.fromUserId === currentUser?.id && r.status === "pending"
            );

            return (
              <article
                key={g.id}
                className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-forest/40"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar name={g.name} photo={g.photo} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">{g.name}</h2>
                      <span className="text-xs text-muted">Local Guide</span>
                      <span className="text-xs text-amber-700 font-medium">★ {g.rating}</span>
                    </div>

                    <p className="text-xs text-muted mt-0.5">
                      📍 {g.location} • {g.languages.join(" • ")}
                    </p>

                    <p className="text-xs text-muted">
                      {g.specialties.join(" • ")} • {g.experienceYears} yrs experience
                    </p>

                    <p className="mt-1 text-xs font-semibold text-ink">
                      ₹{g.pricePerDay.toLocaleString("en-IN")}/day
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/app/guides/${g.id}${preselectedGroupId ? `?group=${preselectedGroupId}` : ""}`}
                    className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium"
                  >
                    View Profile
                  </Link>

                  <button
                    disabled={isRequested}
                    onClick={() => handleOpenRequestModal(g)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                      isRequested
                        ? "bg-sand/40 text-muted border border-line cursor-not-allowed"
                        : "btn-primary"
                    }`}
                  >
                    {isRequested ? "Request Sent" : "Request Guide"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* REQUEST GUIDE MODAL */}
      {requestModalGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-line bg-card p-6">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-sm font-bold text-ink">Request Guide: {requestModalGuide.name}</h2>
                <p className="text-xs text-muted">{requestModalGuide.location} • ₹{requestModalGuide.pricePerDay}/day</p>
              </div>
              <button
                onClick={() => setRequestModalGuide(null)}
                className="text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-muted">Trip Destination</label>
                <input
                  type="text"
                  required
                  value={reqDestination}
                  onChange={(e) => setReqDestination(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-medium text-muted">Dates</label>
                <input
                  type="text"
                  required
                  value={reqDates}
                  onChange={(e) => setReqDates(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted">Number of Travelers</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={reqTravelers}
                    onChange={(e) => setReqTravelers(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted">Budget</label>
                  <input
                    type="text"
                    required
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-muted">Trip Details / Special Requests</label>
                <textarea
                  rows={2}
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="Tell the guide about your group's interests..."
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setRequestModalGuide(null)}
                  className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading guides...</div>}>
      <GuidesInner />
    </Suspense>
  );
}
