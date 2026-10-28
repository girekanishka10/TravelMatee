"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDateRange, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { ExploreFilters } from "@/lib/types";
import { Avatar, FemaleTag } from "@/components/Ui";

export default function ExplorePage() {
  const { exploreTrips, guides, recommendedTravelers } = useApp();

  const [activeTab, setActiveTab] = useState<"groups" | "travelers" | "guides" | "all">("groups");

  const [filters, setFilters] = useState<ExploreFilters>({
    destination: "",
    startDate: "",
    endDate: "",
    startingLocation: "",
    budgetMin: 0,
    budgetMax: 50000,
    groupSize: 1,
    travelStyle: "any",
    onlyRecruiting: false,
  });

  const [hasFilters, setHasFilters] = useState(false);

  function resetFilters() {
    setFilters({
      destination: "",
      startDate: "",
      endDate: "",
      startingLocation: "",
      budgetMin: 0,
      budgetMax: 50000,
      groupSize: 1,
      travelStyle: "any",
      onlyRecruiting: false,
    });
    setHasFilters(false);
  }

  // Explore trips
  const results = useMemo(() => {
    return exploreTrips(hasFilters ? filters : {});
  }, [exploreTrips, filters, hasFilters]);

  // Groups currently recruiting travelers (with available slots)
  const recruitingGroups = useMemo(() => {
    return results.filter(({ trip, group }) => {
      const slotsLeft = trip.groupSize - group.memberIds.length;
      return group.recruiting && slotsLeft > 0;
    });
  }, [results]);

  // Filtered travelers
  const travelersList = useMemo(() => {
    const list = recommendedTravelers();
    if (!filters.destination) return list;
    return list.filter(
      (t) =>
        t.user.city.toLowerCase().includes(filters.destination.toLowerCase()) ||
        t.user.bio.toLowerCase().includes(filters.destination.toLowerCase())
    );
  }, [recommendedTravelers, filters.destination]);

  // Filtered guides
  const guidesList = useMemo(() => {
    return guides.filter((g) => {
      if (filters.destination) {
        const destMatch =
          g.location.toLowerCase().includes(filters.destination.toLowerCase()) ||
          g.destinations?.some((d) => d.toLowerCase().includes(filters.destination.toLowerCase())) ||
          g.areasCovered.some((a) => a.toLowerCase().includes(filters.destination.toLowerCase()));
        if (!destMatch) return false;
      }
      if (hasFilters && filters.budgetMax && g.pricePerDay > filters.budgetMax) {
        return false;
      }
      return true;
    });
  }, [guides, filters, hasFilters]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-6">
      {/* Title & Description */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Explore</h1>
        <p className="mt-1 text-sm text-muted">
          Find existing groups looking for travelers, compatible companions, and local guides.
        </p>
      </div>

      {/* Filter Card */}
      <div className="mt-5 rounded-xl border border-line bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Destination</label>
            <input
              placeholder="e.g. Manali, Goa, Ladakh"
              value={filters.destination}
              onChange={(e) => {
                setFilters({ ...filters, destination: e.target.value });
                setHasFilters(true);
              }}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Travel Style</label>
            <select
              value={filters.travelStyle}
              onChange={(e) => {
                setFilters({ ...filters, travelStyle: e.target.value });
                setHasFilters(true);
              }}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
            >
              <option value="any">Any Style</option>
              <option value="adventure">Adventure</option>
              <option value="relaxing">Relaxing</option>
              <option value="cultural">Cultural</option>
              <option value="nature">Nature</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">Max Budget (₹)</label>
            <input
              type="number"
              step={1000}
              value={filters.budgetMax}
              onChange={(e) => {
                setFilters({ ...filters, budgetMax: Number(e.target.value) });
                setHasFilters(true);
              }}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-forest"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-line text-xs">
          <span className="text-muted">
            {hasFilters ? "Filters active" : "Showing all active listings"}
          </span>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-muted hover:text-ink underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-line">
        <button
          onClick={() => setActiveTab("groups")}
          className={`pb-2.5 text-xs font-medium border-b-2 mr-5 transition-colors ${
            activeTab === "groups"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Groups Looking for Travelers ({recruitingGroups.length})
        </button>
        <button
          onClick={() => setActiveTab("travelers")}
          className={`pb-2.5 text-xs font-medium border-b-2 mr-5 transition-colors ${
            activeTab === "travelers"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Travelers ({travelersList.length})
        </button>
        <button
          onClick={() => setActiveTab("guides")}
          className={`pb-2.5 text-xs font-medium border-b-2 mr-5 transition-colors ${
            activeTab === "guides"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Local Guides ({guidesList.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-forest text-forest font-semibold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          All Trips ({results.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* GROUPS LOOKING FOR TRAVELERS */}
        {activeTab === "groups" && (
          <div className="space-y-3.5">
            {recruitingGroups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No groups currently recruiting travelers matching these filters. Try resetting filters.
              </div>
            ) : (
              recruitingGroups.map(({ trip, group, score }) => {
                const filled = group.memberIds.length;
                const max = trip.groupSize;
                const lookingFor = max - filled;

                return (
                  <article
                    key={trip.id}
                    className="rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-ink">
                          {trip.destination} Trip
                        </h2>
                        <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-medium text-forest capitalize">
                          {trip.travelStyle}
                        </span>
                        {score && (
                          <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-ink">
                            {score.overall}% Match
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-muted">
                        📅 {formatDateRange(trip.startDate, trip.endDate)} • 💰 {formatINR(trip.budgetMin)}–{formatINR(trip.budgetMax)}
                      </p>

                      <p className="mt-1 text-xs font-medium text-forest">
                        👥 {filled}/{max} travelers • Looking for {lookingFor} more
                      </p>

                      {trip.description && (
                        <p className="mt-1.5 text-xs text-muted line-clamp-1 max-w-lg">
                          {trip.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/app/explore/${trip.id}`}
                        className="btn-primary rounded-lg px-4 py-2 text-xs"
                      >
                        View Group
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* TRAVELER PROFILES */}
        {activeTab === "travelers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {travelersList.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No travelers found.
              </div>
            ) : (
              travelersList.map(({ user, score }) => (
                <article
                  key={user.id}
                  className="rounded-xl border border-line bg-card p-4 flex items-start gap-3.5"
                >
                  <Avatar name={user.name} photo={user.profilePhoto} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h2 className="text-sm font-semibold text-ink truncate">{user.name}</h2>
                        {user.gender === "female" && <FemaleTag />}
                      </div>
                      <span className="text-[11px] font-medium text-forest shrink-0">
                        {score.overall}% Match
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{user.city}</p>
                    <p className="mt-1 text-xs text-muted line-clamp-2">{user.bio}</p>
                    <div className="mt-2.5">
                      <Link
                        href={`/app/travelers/${user.id}`}
                        className="text-xs text-forest hover:underline font-medium"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* GUIDES */}
        {activeTab === "guides" && (
          <div className="space-y-3.5">
            {guidesList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No registered guides found.
              </div>
            ) : (
              guidesList.map((g) => (
                <article
                  key={g.id}
                  className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar name={g.name} photo={g.photo} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-ink">{g.name}</h2>
                        <span className="text-xs text-muted">Local Guide</span>
                        <span className="text-xs text-amber-700 font-medium">★ {g.rating}</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        📍 {g.location} • {g.languages.join(" • ")}
                      </p>
                      <p className="text-xs text-muted">
                        Specialties: {g.specialties.join(" • ")}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink">
                        ₹{g.pricePerDay.toLocaleString("en-IN")}/day
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/app/guides/${g.id}`}
                      className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/app/guides/${g.id}?action=request`}
                      className="btn-primary rounded-lg px-3.5 py-1.5 text-xs"
                    >
                      Request Guide
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* ALL TRIPS (INCLUDING FULL ONES) */}
        {activeTab === "all" && (
          <div className="space-y-3.5">
            {results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No trips found. Create a new group to start a trip.
              </div>
            ) : (
              results.map(({ trip, group }) => {
                const filled = group.memberIds.length;
                const max = trip.groupSize;
                const isFull = filled >= max;

                return (
                  <article
                    key={trip.id}
                    className="rounded-xl border border-line bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-ink">{trip.destination}</h2>
                        {isFull ? (
                          <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-muted">
                            Group Full ({filled}/{max})
                          </span>
                        ) : (
                          <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                            Open ({filled}/{max})
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        📅 {formatDateRange(trip.startDate, trip.endDate)} • 💰 {formatINR(trip.budgetMin)}–{formatINR(trip.budgetMax)}
                      </p>
                    </div>
                    <Link
                      href={`/app/explore/${trip.id}`}
                      className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-sand transition-colors shrink-0"
                    >
                      View Details
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}
