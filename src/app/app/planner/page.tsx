"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function TripPlannerPage() {
  const {
    activePlan,
    tripPlans,
    setActivePlanId,
    createTripPlan,
    addPlannerActivity,
    updatePlannerActivity,
    deletePlannerActivity,
    addPlannerBooking,
    deletePlannerBooking,
    addPlannerLocation,
    deletePlannerLocation,
    addPlannerExpense,
    deletePlannerExpense,
    generateDayPlan,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "bookings" | "map" | "budget">("overview");

  // New Activity Form State
  const [newActDay, setNewActDay] = useState(1);
  const [newActTime, setNewActTime] = useState("10:00");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActDetails, setNewActDetails] = useState("");
  const [newActCategory, setNewActCategory] = useState<"sightseeing" | "food" | "transport" | "stay" | "activity">("sightseeing");
  const [showActModal, setShowActModal] = useState(false);

  // New Booking Form State
  const [bkType, setBkType] = useState<"flight" | "hotel" | "rental car" | "train/bus" | "other">("hotel");
  const [bkProvider, setBkProvider] = useState("");
  const [bkDateTime, setBkDateTime] = useState("");
  const [bkRef, setBkRef] = useState("");
  const [bkNotes, setBkNotes] = useState("");
  const [showBkModal, setShowBkModal] = useState(false);

  // New Location Form State
  const [locName, setLocName] = useState("");
  const [locTime, setLocTime] = useState("20 mins");
  const [locRoute, setLocRoute] = useState("");
  const [showLocModal, setShowLocModal] = useState(false);

  // New Expense Form State
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<"Transport" | "Stay" | "Food" | "Activities" | "Other">("Food");
  const [expAmount, setExpAmount] = useState<number>(500);
  const [showExpModal, setShowExpModal] = useState(false);

  // AI "Plan my day" State
  const [aiPrompt, setAiPrompt] = useState("Plan a relaxed day in Manali with cafes and sightseeing.");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Create Plan Form State
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanDest, setNewPlanDest] = useState("");
  const [newPlanDates, setNewPlanDates] = useState("");
  const [newPlanBudget, setNewPlanBudget] = useState(25000);

  if (!activePlan) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="font-serif text-3xl font-bold">Trip Planner</h1>
        <p className="mt-2 text-sm text-muted">Create a personalized itinerary for your solo or private group trip.</p>
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="btn-primary mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold"
        >
          + Create New Trip Plan
        </button>
      </main>
    );
  }

  // Budget calculations
  const totalBudget = activePlan.totalBudget || 20000;
  const totalSpent = (activePlan.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetSpentPct = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    createTripPlan({
      title: `${newPlanDest} Itinerary`,
      destination: newPlanDest,
      dates: newPlanDates,
      totalBudget: newPlanBudget,
      activities: [],
      bookings: [],
      locations: [],
      expenses: [],
    });
    setShowNewPlanModal(false);
  }

  function handleAddActivitySubmit(e: React.FormEvent) {
    e.preventDefault();
    addPlannerActivity(activePlan!.id, {
      day: Number(newActDay),
      time: newActTime,
      title: newActTitle,
      details: newActDetails,
      category: newActCategory,
    });
    setNewActTitle("");
    setNewActDetails("");
    setShowActModal(false);
  }

  function handleAddBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPlannerBooking(activePlan!.id, {
      type: bkType,
      provider: bkProvider,
      dateTime: bkDateTime,
      referenceNumber: bkRef,
      notes: bkNotes,
    });
    setBkProvider("");
    setBkDateTime("");
    setBkRef("");
    setBkNotes("");
    setShowBkModal(false);
  }

  function handleAddLocationSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPlannerLocation(activePlan!.id, {
      name: locName,
      order: (activePlan!.locations || []).length + 1,
      travelTimeFromPrev: locTime,
      routeInfo: locRoute,
    });
    setLocName("");
    setLocRoute("");
    setShowLocModal(false);
  }

  function handleAddExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPlannerExpense(activePlan!.id, {
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toISOString().split("T")[0],
    });
    setExpTitle("");
    setExpAmount(500);
    setShowExpModal(false);
  }

  function handleAiGenerate() {
    generateDayPlan(activePlan!.id, aiPrompt);
    setAiFeedback("Suggested activities added to your itinerary!");
    setTimeout(() => setAiFeedback(null), 3000);
  }

  // Group activities by Day
  const activitiesByDay: Record<number, typeof activePlan.activities> = {};
  (activePlan.activities || []).forEach((act) => {
    if (!activitiesByDay[act.day]) activitiesByDay[act.day] = [];
    activitiesByDay[act.day].push(act);
  });
  const daysList = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Header and Trip Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-ink">Trip Planner</h1>
            <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-ink font-medium">
              {activePlan.destination}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {activePlan.destination} • {activePlan.dates} • Budget: {formatINR(totalBudget)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tripPlans && tripPlans.length > 1 && (
            <select
              value={activePlan.id}
              onChange={(e) => setActivePlanId(e.target.value)}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs text-ink outline-none"
            >
              {tripPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.destination} ({p.dates})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowNewPlanModal(true)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-sand transition-colors"
          >
            + New Trip
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-line">
        {(["overview", "itinerary", "bookings", "map", "budget"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-xs font-medium border-b-2 mr-6 capitalize transition-colors ${
              activeTab === tab
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Itinerary Days</p>
                <p className="mt-1 text-2xl font-bold text-ink">{daysList.length || 0} Days</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Bookings</p>
                <p className="mt-1 text-2xl font-bold text-ink">{(activePlan.bookings || []).length} Saved</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Budget Spent</p>
                <p className="mt-1 text-2xl font-bold text-forest">{budgetSpentPct}%</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Remaining</p>
                <p className="mt-1 text-2xl font-bold text-ink">{formatINR(remainingBudget)}</p>
              </div>
            </div>

            {/* AI Recommendations section ("Plan my day") */}
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Plan My Day</h2>
                  <p className="text-xs text-muted">Generate practical suggestions directly into your schedule.</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Plan a relaxed day in Manali with cafes and sightseeing."
                  className="flex-1 rounded-lg border border-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-forest"
                />
                <button
                  onClick={handleAiGenerate}
                  className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold shrink-0"
                >
                  Generate Plan
                </button>
              </div>

              {aiFeedback && (
                <p className="mt-2 text-xs font-medium text-forest">{aiFeedback}</p>
              )}
            </div>

            {/* Next Upcoming Activities */}
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink">Upcoming Itinerary Highlights</h2>
                <button
                  onClick={() => setActiveTab("itinerary")}
                  className="text-xs text-forest hover:underline font-medium"
                >
                  View Full Schedule →
                </button>
              </div>

              <div className="space-y-2">
                {(activePlan.activities || []).slice(0, 4).map((act) => (
                  <div key={act.id} className="rounded-lg border border-line bg-paper p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-forest mr-2">Day {act.day} • {act.time}</span>
                      <strong className="text-ink">{act.title}</strong>
                      {act.details && <p className="text-muted mt-0.5">{act.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === "itinerary" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Daily Schedule</h2>
                <p className="text-xs text-muted">Chronological timeline of activities, transport, and check-ins.</p>
              </div>
              <button
                onClick={() => setShowActModal(true)}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Activity
              </button>
            </div>

            {daysList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No activities planned yet. Tap <strong>+ Add Activity</strong> or use <strong>Plan my day</strong> in Overview.
              </div>
            ) : (
              daysList.map((dayNum) => (
                <div key={dayNum} className="rounded-xl border border-line bg-card p-5">
                  <h3 className="font-serif text-base font-bold text-ink border-b border-line pb-2 mb-3">
                    Day {dayNum}
                  </h3>

                  <div className="space-y-2.5">
                    {activitiesByDay[dayNum].map((act) => (
                      <div
                        key={act.id}
                        className="rounded-lg border border-line bg-paper p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <span className="rounded bg-sand px-2 py-0.5 font-mono text-[11px] font-semibold text-ink shrink-0">
                            {act.time}
                          </span>
                          <div>
                            <strong className="text-ink text-sm block">{act.title}</strong>
                            {act.details && <p className="text-muted mt-0.5">{act.details}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              const newTime = prompt("Change activity time (HH:MM):", act.time);
                              if (newTime) updatePlannerActivity(activePlan.id, act.id, { time: newTime });
                            }}
                            className="text-[11px] text-muted hover:text-ink underline"
                          >
                            Change time
                          </button>
                          <button
                            onClick={() => deletePlannerActivity(activePlan.id, act.id)}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Trip Bookings & Reservations</h2>
                <p className="text-xs text-muted">
                  Track flights, stays, car rentals, and bus tickets manually. (Architecture ready for future email parsing integration).
                </p>
              </div>
              <button
                onClick={() => setShowBkModal(true)}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Booking
              </button>
            </div>

            <div className="space-y-3">
              {(activePlan.bookings || []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                  No reservations logged yet. Add your flight, hotel or train confirmation details.
                </div>
              ) : (
                (activePlan.bookings || []).map((bk) => (
                  <article key={bk.id} className="rounded-xl border border-line bg-card p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-semibold text-forest uppercase">
                          {bk.type}
                        </span>
                        <h3 className="text-sm font-semibold text-ink">{bk.provider}</h3>
                      </div>
                      <p className="text-muted mt-1">
                        📅 {bk.dateTime} • Reference / PNR: <strong className="text-ink font-mono">{bk.referenceNumber}</strong>
                      </p>
                      {bk.notes && <p className="text-muted mt-0.5">Notes: {bk.notes}</p>}
                    </div>

                    <button
                      onClick={() => deletePlannerBooking(activePlan.id, bk.id)}
                      className="text-xs text-red-600 hover:underline self-end sm:self-center"
                    >
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAP / ROUTING TAB */}
        {activeTab === "map" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Route & Waypoints</h2>
                <p className="text-xs text-muted">
                  Ordered destination locations and travel times.
                </p>
              </div>
              <button
                onClick={() => setShowLocModal(true)}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Location
              </button>
            </div>

            {/* Clean data-driven map visualization area */}
            <div className="rounded-xl border border-line bg-paper p-5">
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">Trip Waypoints Sequence</p>
              <div className="space-y-3">
                {(activePlan.locations || []).map((loc, idx) => (
                  <div key={loc.id} className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 rounded-lg border border-line bg-card p-3 text-xs flex items-center justify-between">
                      <div>
                        <strong className="text-ink text-sm block">{loc.name}</strong>
                        <span className="text-muted text-[11px]">
                          Est. Travel Time: {loc.travelTimeFromPrev || "Direct"} {loc.routeInfo ? `• ${loc.routeInfo}` : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => deletePlannerLocation(activePlan.id, loc.id)}
                        className="text-[11px] text-red-600 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === "budget" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Trip Budget & Expenses</h2>
                <p className="text-xs text-muted">Log and categorize shared or personal trip costs.</p>
              </div>
              <button
                onClick={() => setShowExpModal(true)}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Expense
              </button>
            </div>

            {/* Budget Bar */}
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Total Budget: <strong className="text-ink">{formatINR(totalBudget)}</strong></span>
                <span>Spent: <strong className="text-forest">{formatINR(totalSpent)}</strong></span>
                <span>Remaining: <strong className="text-ink">{formatINR(remainingBudget)}</strong></span>
              </div>
              <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full bg-forest transition-all"
                  style={{ width: `${budgetSpentPct}%` }}
                />
              </div>
            </div>

            {/* Expenses List */}
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Expenses Log</h3>
              <div className="divide-y divide-line">
                {(activePlan.expenses || []).length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted">No expenses recorded yet.</p>
                ) : (
                  (activePlan.expenses || []).map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-ink block">{exp.title}</strong>
                        <span className="text-[11px] text-muted">{exp.category} {exp.date ? `• ${exp.date}` : ""}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-ink">{formatINR(exp.amount)}</span>
                        <button
                          onClick={() => deletePlannerExpense(activePlan.id, exp.id)}
                          className="text-[11px] text-red-600 hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Add Activity Modal */}
      {showActModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">Add Itinerary Activity</h3>
            <form onSubmit={handleAddActivitySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted">Day Number</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newActDay}
                    onChange={(e) => setNewActDay(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-line bg-paper p-2"
                  />
                </div>
                <div>
                  <label className="block text-muted">Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={newActTime}
                    onChange={(e) => setNewActTime(e.target.value)}
                    className="mt-1 w-full rounded border border-line bg-paper p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hotel check-in"
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Category</label>
                <select
                  value={newActCategory}
                  onChange={(e) => setNewActCategory(e.target.value as typeof newActCategory)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="stay">Stay</option>
                  <option value="activity">Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-muted">Details / Location Notes</label>
                <textarea
                  rows={2}
                  value={newActDetails}
                  onChange={(e) => setNewActDetails(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowActModal(false)}
                  className="rounded border border-line px-3 py-1.5 text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Booking Modal */}
      {showBkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">Add Manual Booking</h3>
            <form onSubmit={handleAddBookingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Reservation Type</label>
                <select
                  value={bkType}
                  onChange={(e) => setBkType(e.target.value as typeof bkType)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                >
                  <option value="hotel">Hotel / Stay</option>
                  <option value="flight">Flight</option>
                  <option value="train/bus">Train / Bus</option>
                  <option value="rental car">Rental Car / Cab</option>
                  <option value="other">Other Reservation</option>
                </select>
              </div>

              <div>
                <label className="block text-muted">Provider / Hotel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indigo, Mountain View Resort"
                  value={bkProvider}
                  onChange={(e) => setBkProvider(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Date & Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 Nov, 12:00 PM"
                  value={bkDateTime}
                  onChange={(e) => setBkDateTime(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Reference / Confirmation #</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6E-8891 / HTL-449"
                  value={bkRef}
                  onChange={(e) => setBkRef(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Breakfast included"
                  value={bkNotes}
                  onChange={(e) => setBkNotes(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowBkModal(false)}
                  className="rounded border border-line px-3 py-1.5 text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Location Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">Add Route Location</h3>
            <form onSubmit={handleAddLocationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solang Valley"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Travel Time from Previous Stop</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 35 mins"
                  value={locTime}
                  onChange={(e) => setLocTime(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Route Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Via NH-3 road"
                  value={locRoute}
                  onChange={(e) => setLocRoute(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="rounded border border-line px-3 py-1.5 text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Expense Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">Add Trip Expense</h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. River rafting pass"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as typeof expCategory)}
                    className="mt-1 w-full rounded border border-line bg-paper p-2"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Stay">Stay</option>
                    <option value="Food">Food</option>
                    <option value="Activities">Activities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted">Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-line bg-paper p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="rounded border border-line px-3 py-1.5 text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">Create New Trip Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manali, Goa, Rishikesh"
                  value={newPlanDest}
                  onChange={(e) => setNewPlanDest(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Dates</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15–20 Nov 2026"
                  value={newPlanDates}
                  onChange={(e) => setNewPlanDates(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div>
                <label className="block text-muted">Total Budget (₹)</label>
                <input
                  type="number"
                  required
                  value={newPlanBudget}
                  onChange={(e) => setNewPlanBudget(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-line bg-paper p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="rounded border border-line px-3 py-1.5 text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
