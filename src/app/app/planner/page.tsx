"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { PlannerActivity, PlannerBooking, PlannerLocation, PlannerExpense } from "@/lib/types";

export default function TripPlannerPage() {
  const {
    activePlan,
    tripPlans,
    currentUser,
    setActivePlanId,
    createTripPlan,
    updateTripPlan,
    addPlannerActivity,
    updatePlannerActivity,
    deletePlannerActivity,
    addPlannerBooking,
    updatePlannerBooking,
    deletePlannerBooking,
    addPlannerLocation,
    updatePlannerLocation,
    deletePlannerLocation,
    addPlannerExpense,
    updatePlannerExpense,
    deletePlannerExpense,
    generateDayPlan,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "bookings" | "map" | "budget">("overview");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Activity Modals State
  const [showActModal, setShowActModal] = useState(false);
  const [editActItem, setEditActItem] = useState<PlannerActivity | null>(null);
  const [actDay, setActDay] = useState(1);
  const [actTime, setActTime] = useState("10:00");
  const [actTitle, setActTitle] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actDetails, setActDetails] = useState("");
  const [actCategory, setActCategory] = useState<"sightseeing" | "food" | "transport" | "stay" | "activity">("sightseeing");

  // Booking Modals State
  const [showBkModal, setShowBkModal] = useState(false);
  const [editBkItem, setEditBkItem] = useState<PlannerBooking | null>(null);
  const [bkType, setBkType] = useState<"flight" | "hotel" | "rental car" | "train/bus" | "other">("hotel");
  const [bkProvider, setBkProvider] = useState("");
  const [bkDateTime, setBkDateTime] = useState("");
  const [bkRef, setBkRef] = useState("");
  const [bkNotes, setBkNotes] = useState("");

  // Location Modals State
  const [showLocModal, setShowLocModal] = useState(false);
  const [editLocItem, setEditLocItem] = useState<PlannerLocation | null>(null);
  const [locName, setLocName] = useState("");
  const [locTime, setLocTime] = useState("30 mins");
  const [locRoute, setLocRoute] = useState("");

  // Expense Modals State
  const [showExpModal, setShowExpModal] = useState(false);
  const [editExpItem, setEditExpItem] = useState<PlannerExpense | null>(null);
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<"Transport" | "Stay" | "Food" | "Activities" | "Other">("Food");
  const [expAmount, setExpAmount] = useState<number>(500);
  const [expDate, setExpDate] = useState("");

  // Total Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editBudgetAmount, setEditBudgetAmount] = useState<number>(20000);

  // AI "Plan my day" State
  const [aiPrompt, setAiPrompt] = useState("Plan a relaxed day in Manali with cafes and sightseeing.");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Create Plan Form State
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanDest, setNewPlanDest] = useState("");
  const [newPlanDates, setNewPlanDates] = useState("");
  const [newPlanBudget, setNewPlanBudget] = useState(25000);

  function triggerNotice(msg: string) {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  }

  // Handle Create Plan
  function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlanDest.trim()) return;
    const plan = createTripPlan({
      title: `${newPlanDest} Itinerary`,
      destination: newPlanDest.trim(),
      dates: newPlanDates.trim() || "Upcoming",
      totalBudget: Number(newPlanBudget) || 20000,
      userId: currentUser?.id,
      activities: [],
      bookings: [],
      locations: [],
      expenses: [],
    });
    setShowNewPlanModal(false);
    setNewPlanDest("");
    setNewPlanDates("");
    triggerNotice(`Trip plan for ${plan.destination} created!`);
  }

  // --- ACTIVITY HANDLERS ---
  function openAddActivity() {
    setActDay(1);
    setActTime("10:00");
    setActTitle("");
    setActLocation("");
    setActDetails("");
    setActCategory("sightseeing");
    setEditActItem(null);
    setShowActModal(true);
  }

  function openEditActivity(act: PlannerActivity) {
    setActDay(act.day);
    setActTime(act.time);
    setActTitle(act.title);
    setActLocation(act.location || "");
    setActDetails(act.details || act.notes || "");
    setActCategory(act.category || "sightseeing");
    setEditActItem(act);
    setShowActModal(true);
  }

  function handleSaveActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activePlan || !actTitle.trim()) return;

    if (editActItem) {
      updatePlannerActivity(activePlan.id, editActItem.id, {
        day: Number(actDay),
        time: actTime.trim(),
        title: actTitle.trim(),
        location: actLocation.trim() || undefined,
        details: actDetails.trim() || undefined,
        notes: actDetails.trim() || undefined,
        category: actCategory,
      });
      triggerNotice("Activity updated successfully!");
    } else {
      addPlannerActivity(activePlan.id, {
        day: Number(actDay),
        time: actTime.trim(),
        title: actTitle.trim(),
        location: actLocation.trim() || undefined,
        details: actDetails.trim() || undefined,
        notes: actDetails.trim() || undefined,
        category: actCategory,
      });
      triggerNotice("New activity added to itinerary!");
    }
    setShowActModal(false);
    setEditActItem(null);
  }

  function handleDeleteActivity(activityId: string) {
    if (!activePlan) return;
    deletePlannerActivity(activePlan.id, activityId);
    triggerNotice("Activity removed from itinerary.");
  }

  // --- BOOKING HANDLERS ---
  function openAddBooking() {
    setBkType("hotel");
    setBkProvider("");
    setBkDateTime("");
    setBkRef("");
    setBkNotes("");
    setEditBkItem(null);
    setShowBkModal(true);
  }

  function openEditBooking(bk: PlannerBooking) {
    setBkType(bk.type);
    setBkProvider(bk.provider);
    setBkDateTime(bk.dateTime);
    setBkRef(bk.referenceNumber);
    setBkNotes(bk.notes || "");
    setEditBkItem(bk);
    setShowBkModal(true);
  }

  function handleSaveBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!activePlan || !bkProvider.trim()) return;

    if (editBkItem) {
      updatePlannerBooking(activePlan.id, editBkItem.id, {
        type: bkType,
        provider: bkProvider.trim(),
        dateTime: bkDateTime.trim(),
        referenceNumber: bkRef.trim(),
        notes: bkNotes.trim() || undefined,
      });
      triggerNotice("Booking details updated!");
    } else {
      addPlannerBooking(activePlan.id, {
        type: bkType,
        provider: bkProvider.trim(),
        dateTime: bkDateTime.trim(),
        referenceNumber: bkRef.trim(),
        notes: bkNotes.trim() || undefined,
      });
      triggerNotice("New booking saved!");
    }
    setShowBkModal(false);
    setEditBkItem(null);
  }

  function handleDeleteBooking(bookingId: string) {
    if (!activePlan) return;
    deletePlannerBooking(activePlan.id, bookingId);
    triggerNotice("Booking removed.");
  }

  // --- LOCATION STOP HANDLERS ---
  function openAddLocation() {
    setLocName("");
    setLocTime("30 mins");
    setLocRoute("");
    setEditLocItem(null);
    setShowLocModal(true);
  }

  function openEditLocation(loc: PlannerLocation) {
    setLocName(loc.name);
    setLocTime(loc.travelTimeFromPrev || "Direct");
    setLocRoute(loc.routeInfo || "");
    setEditLocItem(loc);
    setShowLocModal(true);
  }

  function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!activePlan || !locName.trim()) return;

    if (editLocItem) {
      updatePlannerLocation(activePlan.id, editLocItem.id, {
        name: locName.trim(),
        travelTimeFromPrev: locTime.trim() || undefined,
        routeInfo: locRoute.trim() || undefined,
      });
      triggerNotice("Location stop updated!");
    } else {
      addPlannerLocation(activePlan.id, {
        name: locName.trim(),
        order: (activePlan.locations || []).length + 1,
        travelTimeFromPrev: locTime.trim() || undefined,
        routeInfo: locRoute.trim() || undefined,
      });
      triggerNotice("New waypoint stop added!");
    }
    setShowLocModal(false);
    setEditLocItem(null);
  }

  function handleDeleteLocation(locId: string) {
    if (!activePlan) return;
    deletePlannerLocation(activePlan.id, locId);
    triggerNotice("Location stop removed.");
  }

  // --- EXPENSE HANDLERS ---
  function openAddExpense() {
    setExpTitle("");
    setExpCategory("Food");
    setExpAmount(500);
    setExpDate(new Date().toISOString().split("T")[0]);
    setEditExpItem(null);
    setShowExpModal(true);
  }

  function openEditExpense(exp: PlannerExpense) {
    setExpTitle(exp.title);
    setExpCategory(exp.category);
    setExpAmount(exp.amount);
    setExpDate(exp.date || new Date().toISOString().split("T")[0]);
    setEditExpItem(exp);
    setShowExpModal(true);
  }

  function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!activePlan || !expTitle.trim()) return;

    if (editExpItem) {
      updatePlannerExpense(activePlan.id, editExpItem.id, {
        title: expTitle.trim(),
        category: expCategory,
        amount: Number(expAmount) || 0,
        date: expDate || undefined,
      });
      triggerNotice("Expense updated!");
    } else {
      addPlannerExpense(activePlan.id, {
        title: expTitle.trim(),
        category: expCategory,
        amount: Number(expAmount) || 0,
        date: expDate || new Date().toISOString().split("T")[0],
      });
      triggerNotice("Expense added to budget!");
    }
    setShowExpModal(false);
    setEditExpItem(null);
  }

  function handleDeleteExpense(expId: string) {
    if (!activePlan) return;
    deletePlannerExpense(activePlan.id, expId);
    triggerNotice("Expense deleted.");
  }

  function handleSaveBudgetTotal(e: React.FormEvent) {
    e.preventDefault();
    if (!activePlan) return;
    updateTripPlan(activePlan.id, { totalBudget: Number(editBudgetAmount) || 0 });
    setShowBudgetModal(false);
    triggerNotice("Total budget updated!");
  }

  function handleAiGenerate() {
    if (!activePlan) return;
    generateDayPlan(activePlan.id, aiPrompt);
    setAiFeedback("Suggested activities added to Day 4 of your itinerary!");
    setTimeout(() => setAiFeedback(null), 3500);
  }

  // Empty state fallback when no plans exist
  if (!activePlan) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Trip Planner</h1>
        <p className="mt-2 text-sm text-muted">Create a personalized itinerary for your solo or private group trip.</p>
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="btn-primary mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold"
        >
          + Create New Trip Plan
        </button>

        {showNewPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5 text-left">
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
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted">Dates</label>
                  <input
                    type="text"
                    placeholder="e.g. 15–20 Nov 2026"
                    value={newPlanDates}
                    onChange={(e) => setNewPlanDates(e.target.value)}
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted">Total Budget (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    value={newPlanBudget}
                    onChange={(e) => setNewPlanBudget(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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
                  <button type="submit" className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs">
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

  // Budget calculations
  const totalBudget = activePlan.totalBudget || 20000;
  const totalSpent = (activePlan.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetSpentPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // Group activities by Day
  const activitiesByDay: Record<number, PlannerActivity[]> = {};
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
            {activePlan.destination} • {activePlan.dates} • Total Budget: <strong className="text-ink">{formatINR(totalBudget)}</strong>
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
            + New Trip Plan
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="mt-4 rounded-lg bg-[#eef5f0] border border-[#b5d2be] px-4 py-2.5 text-xs text-[#153a25] font-medium">
          ✓ {feedbackNotice}
        </div>
      )}

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
            {tab === "map" ? "Map & Waypoints" : tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Itinerary Days</p>
                <p className="mt-1 text-2xl font-bold text-ink">{daysList.length || 0} Days</p>
                <p className="text-[10px] text-muted mt-0.5">{(activePlan.activities || []).length} scheduled items</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Bookings</p>
                <p className="mt-1 text-2xl font-bold text-ink">{(activePlan.bookings || []).length} Saved</p>
                <p className="text-[10px] text-muted mt-0.5">Stays, transport & tours</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Budget Spent</p>
                <p className="mt-1 text-2xl font-bold text-forest">{budgetSpentPct}%</p>
                <p className="text-[10px] text-muted mt-0.5">{formatINR(totalSpent)} spent</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Remaining</p>
                <p className="mt-1 text-2xl font-bold text-ink">{formatINR(remainingBudget)}</p>
                <p className="text-[10px] text-muted mt-0.5">of {formatINR(totalBudget)}</p>
              </div>
            </div>

            {/* AI Recommendations section ("Plan my day") */}
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="border-b border-line pb-3">
                <h2 className="text-sm font-semibold text-ink">Plan My Day</h2>
                <p className="text-xs text-muted mt-0.5">
                  Generate practical day suggestions directly into your schedule based on your travel vibe.
                </p>
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
                {(activePlan.activities || []).length === 0 ? (
                  <p className="text-xs text-muted py-2">No activities added yet. Add an activity from the Itinerary tab.</p>
                ) : (
                  (activePlan.activities || []).slice(0, 5).map((act) => (
                    <div key={act.id} className="rounded-lg border border-line bg-paper p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-forest mr-2">Day {act.day} • {act.time}</span>
                        <strong className="text-ink">{act.title}</strong>
                        {act.location && <span className="text-muted ml-2">• 📍 {act.location}</span>}
                        {act.details && <p className="text-muted mt-0.5">{act.details}</p>}
                      </div>
                      <span className="rounded bg-sand px-2 py-0.5 text-[10px] uppercase font-semibold text-muted">
                        {act.category || "activity"}
                      </span>
                    </div>
                  ))
                )}
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
                onClick={openAddActivity}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Activity
              </button>
            </div>

            {daysList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                No activities planned yet. Click <strong>+ Add Activity</strong> to start scheduling your days.
              </div>
            ) : (
              daysList.map((dayNum) => (
                <div key={dayNum} className="rounded-xl border border-line bg-card p-5">
                  <h3 className="font-serif text-base font-bold text-ink border-b border-line pb-2 mb-3 flex items-center justify-between">
                    <span>Day {dayNum}</span>
                    <span className="text-xs font-normal text-muted">
                      {activitiesByDay[dayNum].length} item{activitiesByDay[dayNum].length === 1 ? "" : "s"}
                    </span>
                  </h3>

                  <div className="space-y-2.5">
                    {activitiesByDay[dayNum].map((act) => (
                      <div
                        key={act.id}
                        className="rounded-lg border border-line bg-paper p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="rounded bg-sand px-2 py-0.5 font-mono text-[11px] font-semibold text-ink shrink-0">
                            {act.time}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-ink text-sm block">{act.title}</strong>
                              <span className="rounded bg-sand/60 px-2 py-0.5 text-[10px] uppercase text-muted font-medium">
                                {act.category || "activity"}
                              </span>
                            </div>
                            {act.location && (
                              <p className="text-muted text-[11px] mt-0.5">📍 {act.location}</p>
                            )}
                            {(act.details || act.notes) && (
                              <p className="text-muted mt-0.5">{act.details || act.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => openEditActivity(act)}
                            className="btn-secondary rounded px-2.5 py-1 text-[11px] font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="rounded px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 font-medium"
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
                  Log flights, hotels, trains, buses, car rentals, and tour reservations.
                </p>
              </div>
              <button
                onClick={openAddBooking}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Booking
              </button>
            </div>

            <div className="space-y-3">
              {(activePlan.bookings || []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-muted">
                  No reservations logged yet. Click <strong>+ Add Booking</strong> to track your tickets and stay confirmations.
                </div>
              ) : (
                (activePlan.bookings || []).map((bk) => (
                  <article key={bk.id} className="rounded-xl border border-line bg-card p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-semibold text-forest uppercase">
                          {bk.type}
                        </span>
                        <h3 className="text-sm font-semibold text-ink">{bk.provider}</h3>
                      </div>
                      <p className="text-muted mt-1">
                        📅 {bk.dateTime} • Reference / PNR: <strong className="text-ink font-mono">{bk.referenceNumber || "N/A"}</strong>
                      </p>
                      {bk.notes && <p className="text-muted mt-0.5">Notes: {bk.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => openEditBooking(bk)}
                        className="btn-secondary rounded px-2.5 py-1 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(bk.id)}
                        className="rounded px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 font-medium"
                      >
                        Delete
                      </button>
                    </div>
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
                onClick={openAddLocation}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                + Add Stop
              </button>
            </div>

            {/* Offline route planner fallback notice */}
            <div className="rounded-lg bg-sand/40 border border-line p-3 text-xs text-muted flex items-center justify-between">
              <span>📍 Route planner is running in offline waypoint mode. Stops and transit times are calculated sequentially.</span>
              <span className="font-semibold text-forest">{(activePlan.locations || []).length} Waypoints</span>
            </div>

            {/* Waypoints sequence */}
            <div className="rounded-xl border border-line bg-paper p-5">
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">Trip Waypoints Sequence</p>
              {(activePlan.locations || []).length === 0 ? (
                <p className="text-xs text-muted py-4 text-center">No route stops added yet. Click <strong>+ Add Stop</strong> to outline your itinerary path.</p>
              ) : (
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
                            Transit from previous: {loc.travelTimeFromPrev || "Start Point"} {loc.routeInfo ? `• ${loc.routeInfo}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => openEditLocation(loc)}
                            className="text-[11px] text-muted hover:text-ink underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditBudgetAmount(totalBudget);
                    setShowBudgetModal(true);
                  }}
                  className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  Edit Total Budget
                </button>
                <button
                  onClick={openAddExpense}
                  className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
                >
                  + Add Expense
                </button>
              </div>
            </div>

            {/* Budget Bar */}
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Total Budget: <strong className="text-ink">{formatINR(totalBudget)}</strong></span>
                <span>Spent: <strong className="text-forest">{formatINR(totalSpent)}</strong></span>
                <span>Remaining: <strong className="text-ink">{formatINR(remainingBudget)}</strong></span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-sand overflow-hidden">
                <div
                  className={`h-full transition-all ${budgetSpentPct > 90 ? "bg-red-600" : "bg-forest"}`}
                  style={{ width: `${budgetSpentPct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted text-right">
                {budgetSpentPct}% of budget utilized
              </p>
            </div>

            {/* Expenses List */}
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Expenses Log ({(activePlan.expenses || []).length})
              </h3>
              <div className="divide-y divide-line">
                {(activePlan.expenses || []).length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted">No expenses recorded yet. Click <strong>+ Add Expense</strong> to track costs.</p>
                ) : (
                  (activePlan.expenses || []).map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-ink block">{exp.title}</strong>
                        <span className="text-[11px] text-muted">
                          {exp.category} {exp.date ? `• ${exp.date}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-ink">{formatINR(exp.amount)}</span>
                        <button
                          onClick={() => openEditExpense(exp)}
                          className="text-[11px] text-muted hover:text-ink underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
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

      {/* --- MODALS --- */}

      {/* 1. Add / Edit Activity Modal */}
      {showActModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">
              {editActItem ? "Edit Activity" : "Add Itinerary Activity"}
            </h3>
            <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted">Day Number</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={actDay}
                    onChange={(e) => setActDay(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted">Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hotel check-in, Summit hike"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Location / Stop</label>
                <input
                  type="text"
                  placeholder="e.g. Solang Valley, Old Manali"
                  value={actLocation}
                  onChange={(e) => setActLocation(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Category</label>
                <select
                  value={actCategory}
                  onChange={(e) => setActCategory(e.target.value as typeof actCategory)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="stay">Stay</option>
                  <option value="activity">Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-muted">Details & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes, instructions or landmarks"
                  value={actDetails}
                  onChange={(e) => setActDetails(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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

      {/* 2. Add / Edit Booking Modal */}
      {showBkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">
              {editBkItem ? "Edit Booking" : "Add Booking"}
            </h3>
            <form onSubmit={handleSaveBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Reservation Type</label>
                <select
                  value={bkType}
                  onChange={(e) => setBkType(e.target.value as typeof bkType)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                >
                  <option value="hotel">Hotel / Stay</option>
                  <option value="flight">Flight</option>
                  <option value="train/bus">Train / Bus</option>
                  <option value="rental car">Rental Car / Cab</option>
                  <option value="other">Other Reservation</option>
                </select>
              </div>

              <div>
                <label className="block text-muted">Provider / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indigo, Zostel, IRCTC"
                  value={bkProvider}
                  onChange={(e) => setBkProvider(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g. 15 Nov, 12:00 PM"
                  value={bkDateTime}
                  onChange={(e) => setBkDateTime(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Reference / Confirmation #</label>
                <input
                  type="text"
                  placeholder="e.g. 6E-8891 / PNR-449"
                  value={bkRef}
                  onChange={(e) => setBkRef(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Breakfast included, Terminal 2"
                  value={bkNotes}
                  onChange={(e) => setBkNotes(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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

      {/* 3. Add / Edit Location Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">
              {editLocItem ? "Edit Waypoint Stop" : "Add Route Stop"}
            </h3>
            <form onSubmit={handleSaveLocation} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solang Valley"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Travel Time from Previous Stop</label>
                <input
                  type="text"
                  placeholder="e.g. 35 mins, 2 hrs"
                  value={locTime}
                  onChange={(e) => setLocTime(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Route Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Via NH-3 road scenic route"
                  value={locRoute}
                  onChange={(e) => setLocRoute(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add / Edit Expense Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">
              {editExpItem ? "Edit Expense" : "Add Trip Expense"}
            </h3>
            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. River rafting pass, Dinner"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as typeof expCategory)}
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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
                    className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted">Date</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
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

      {/* 5. Edit Total Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-5">
            <h3 className="font-bold text-sm text-ink mb-3">Edit Total Budget</h3>
            <form onSubmit={handleSaveBudgetTotal} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted">Total Budget (₹)</label>
                <input
                  type="number"
                  min={1000}
                  required
                  value={editBudgetAmount}
                  onChange={(e) => setEditBudgetAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="rounded border border-line px-3 py-1.5 text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary rounded-lg px-4 py-1.5 font-semibold text-xs">
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Plan Modal */}
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
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted">Total Budget (₹)</label>
                <input
                  type="number"
                  required
                  value={newPlanBudget}
                  onChange={(e) => setNewPlanBudget(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink outline-none"
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
