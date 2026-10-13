"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { compareAnswers, compareUserToTrip, compareUsers, tripMatchesFilters } from "./compatibility";
import { uid } from "./format";
import { buildPersonality } from "./personality";
import { createSeedState } from "./seed";
import type {
  AppState,
  CompatibilityAnswers,
  CompatibilityBreakdown,
  ExploreFilters,
  Guide,
  GuideRequest,
  Group,
  GroupJoinRequest,
  Invitation,
  Message,
  Review,
  TravelPhoto,
  Trip,
  TripPlan,
  User,
} from "./types";

const STORAGE_KEY = "travelmate.v5";

type Store = AppState & {
  hydrated: boolean;
  currentUser: User | null;
  currentGuide: Guide | null;
  login: (identifier: string, password: string) => string | null;
  loginAsGuide: (identifier: string, password: string) => string | null;
  logout: () => void;
  signup: (input: Omit<User, "id" | "verificationStatus" | "previousTrips" | "completedTripIds" | "rating" | "completedTripCount" | "blockedUserIds" | "savedTripIds" | "reportedUserIds" | "bio">) => string | null;
  signupAsGuide: (input: Omit<Guide, "id" | "rating" | "verifiedTrips" | "answers">) => string | null;
  verifyCurrentUser: () => void;
  completeQuiz: (answers: CompatibilityAnswers) => void;
  updateProfile: (patch: Partial<User>) => void;
  addTravelPhotos: (photos: { url: string; caption?: string; destination?: string; tripDate?: string }[]) => void;
  deleteTravelPhoto: (photoId: string) => void;
  saveTrip: (tripId: string) => void;
  createTrip: (input: Omit<Trip, "id" | "creatorId" | "status" | "itinerary" | "rules" | "photos"> & {
    itinerary?: Trip["itinerary"];
    rules?: string[];
    initialMembers?: string[];
    inviteUserIds?: string[];
  }) => { trip: Trip; group: Group };
  toggleGroupRecruiting: (groupId: string, state?: boolean) => void;
  inviteTraveler: (groupId: string, userId: string) => { success: boolean; message: string };
  respondInvite: (invitationId: string, accept: boolean) => { success: boolean; message: string };
  requestJoin: (groupId: string) => { success: boolean; message: string };
  requestJoinWithGroup: (
    groupId: string,
    info: {
      groupName: string;
      size: number;
      memberNames: string[];
      destination: string;
      dates: string;
      budget: string;
      interests: string[];
    }
  ) => { success: boolean; message: string };
  respondJoin: (groupId: string, userId: string, accept: boolean) => void;
  respondGroupJoinRequest: (requestId: string, accept: boolean) => { success: boolean; message: string };
  removeMember: (groupId: string, userId: string) => void;
  updateTrip: (tripId: string, patch: Partial<Trip>) => void;
  sendMessage: (groupId: string, message: string, type?: Message["type"], recipientId?: string) => void;
  getDmConversationId: (userA: string, userB: string) => string;
  markMessagesAsRead: (conversationId: string) => void;
  requestGuide: (
    guideId: string,
    tripDetails?: {
      destination: string;
      dates: string;
      budget: string | number;
      interests: string[];
      travelersCount: number;
      notes?: string;
      groupId?: string;
    }
  ) => { success: boolean; message: string };
  respondGuideRequest: (requestId: string, accept: boolean) => { success: boolean; message: string; groupId?: string };
  assignGuide: (tripId: string, guideId: string) => void;
  addReview: (input: Omit<Review, "id" | "verifiedTrip">) => string | null;
  blockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string) => void;
  canReview: (reviewerId: string, reviewedId: string, tripId: string, isGuide?: boolean) => boolean;
  compatibilityWith: (userId: string) => CompatibilityBreakdown | null;
  compatibilityWithTrip: (tripId: string) => CompatibilityBreakdown | null;
  exploreTrips: (filters: Partial<ExploreFilters>) => { trip: Trip; group: Group; score: CompatibilityBreakdown | null }[];
  recommendedTravelers: () => { user: User; score: CompatibilityBreakdown }[];
  
  // Trip Planner methods
  activePlan: TripPlan | null;
  setActivePlanId: (id: string | null) => void;
  createTripPlan: (plan: Omit<TripPlan, "id">) => TripPlan;
  updateTripPlan: (planId: string, patch: Partial<TripPlan>) => void;
  addPlannerActivity: (planId: string, activity: Omit<TripPlan["activities"][0], "id">) => void;
  updatePlannerActivity: (planId: string, activityId: string, patch: Partial<TripPlan["activities"][0]>) => void;
  deletePlannerActivity: (planId: string, activityId: string) => void;
  addPlannerBooking: (planId: string, booking: Omit<TripPlan["bookings"][0], "id">) => void;
  updatePlannerBooking: (planId: string, bookingId: string, patch: Partial<TripPlan["bookings"][0]>) => void;
  deletePlannerBooking: (planId: string, bookingId: string) => void;
  addPlannerLocation: (planId: string, location: Omit<TripPlan["locations"][0], "id">) => void;
  updatePlannerLocation: (planId: string, locationId: string, patch: Partial<TripPlan["locations"][0]>) => void;
  deletePlannerLocation: (planId: string, locationId: string) => void;
  addPlannerExpense: (planId: string, expense: Omit<TripPlan["expenses"][0], "id">) => void;
  updatePlannerExpense: (planId: string, expenseId: string, patch: Partial<TripPlan["expenses"][0]>) => void;
  deletePlannerExpense: (planId: string, expenseId: string) => void;
  generateDayPlan: (planId: string, prompt: string) => void;
};

const Ctx = createContext<Store | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return createSeedState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSeedState();
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const seed = createSeedState();

    // Ensure seed users and newly registered users are preserved without loss
    const savedUsers = Array.isArray(parsed.users) ? parsed.users : [];
    const userMap = new Map<string, User>();
    for (const u of savedUsers) {
      if (u && u.id) {
        userMap.set(u.id, {
          ...u,
          email: (u.email || "").trim().toLowerCase(),
          travelPhotos: Array.isArray(u.travelPhotos) ? u.travelPhotos : [],
        });
      }
    }
    for (const su of seed.users) {
      if (!userMap.has(su.id)) {
        userMap.set(su.id, {
          ...su,
          email: (su.email || "").trim().toLowerCase(),
          travelPhotos: Array.isArray(su.travelPhotos) ? su.travelPhotos : [],
        });
      }
    }
    const mergedUsers = Array.from(userMap.values());

    // Ensure seed guides and registered guides are preserved
    const savedGuides = Array.isArray(parsed.guides) ? parsed.guides : [];
    const guideMap = new Map<string, Guide>();
    for (const g of savedGuides) {
      if (g && g.id) {
        guideMap.set(g.id, g);
      }
    }
    for (const sg of seed.guides) {
      if (!guideMap.has(sg.id)) {
        guideMap.set(sg.id, sg);
      }
    }
    const mergedGuides = Array.from(guideMap.values());

    // Ensure seed trips are preserved
    const savedTrips = Array.isArray(parsed.trips) ? parsed.trips : [];
    const existingTripIds = new Set(savedTrips.map((t) => t.id));
    const mergedTrips = [...savedTrips];
    for (const st of seed.trips) {
      if (!existingTripIds.has(st.id)) {
        mergedTrips.push(st);
      }
    }

    // Ensure seed groups are preserved
    const savedGroups = Array.isArray(parsed.groups) ? parsed.groups : [];
    const existingGroupIds = new Set(savedGroups.map((g) => g.id));
    const mergedGroups = [...savedGroups];
    for (const sg of seed.groups) {
      if (!existingGroupIds.has(sg.id)) {
        mergedGroups.push(sg);
      }
    }

    // Ensure seed trip plans and user-created trip plans are preserved
    const savedTripPlans = Array.isArray(parsed.tripPlans) ? parsed.tripPlans : [];
    const existingPlanIds = new Set(savedTripPlans.map((p) => p.id));
    const mergedTripPlans = [...savedTripPlans];
    for (const sp of seed.tripPlans || []) {
      if (!existingPlanIds.has(sp.id)) {
        mergedTripPlans.push(sp);
      }
    }

    // Ensure seed invitations and user-created invitations are preserved
    const savedInvitations = Array.isArray(parsed.invitations) ? parsed.invitations : [];
    const existingInvIds = new Set(savedInvitations.map((i) => i.id));
    const mergedInvitations = [...savedInvitations];
    for (const si of seed.invitations || []) {
      if (!existingInvIds.has(si.id)) {
        mergedInvitations.push(si);
      }
    }

    // Ensure seed messages and user-created messages are preserved
    const savedMessages = Array.isArray(parsed.messages) ? parsed.messages : [];
    const existingMsgIds = new Set(savedMessages.map((m) => m.id));
    const mergedMessages = [...savedMessages];
    for (const sm of seed.messages || []) {
      if (!existingMsgIds.has(sm.id)) {
        mergedMessages.push(sm);
      }
    }

    let currentUserId: string | null = null;
    if (parsed.currentUserId && mergedUsers.some((u) => u.id === parsed.currentUserId)) {
      currentUserId = parsed.currentUserId;
    } else if (parsed.currentUserId === null) {
      currentUserId = null;
    } else {
      currentUserId = parsed.currentUserId !== undefined ? null : seed.currentUserId;
    }

    let currentGuideId: string | null = null;
    if (parsed.currentGuideId && mergedGuides.some((g) => g.id === parsed.currentGuideId)) {
      currentGuideId = parsed.currentGuideId;
    }

    return {
      users: mergedUsers,
      trips: mergedTrips,
      groups: mergedGroups,
      reviews: Array.isArray(parsed.reviews) && parsed.reviews.length ? parsed.reviews : seed.reviews,
      guides: mergedGuides,
      messages: mergedMessages,
      invitations: mergedInvitations,
      guideRequests: Array.isArray(parsed.guideRequests) && parsed.guideRequests.length ? parsed.guideRequests : seed.guideRequests,
      groupJoinRequests: Array.isArray(parsed.groupJoinRequests) && parsed.groupJoinRequests.length ? parsed.groupJoinRequests : seed.groupJoinRequests,
      tripPlans: mergedTripPlans,
      currentUserId,
      currentGuideId,
      userRole: currentGuideId ? "guide" : currentUserId ? "traveler" : null,
    };
  } catch {
    return createSeedState();
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== "undefined") return loadState();
    return createSeedState();
  });
  const [hydrated, setHydrated] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setHydrated(true);
    isLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated || !isLoadedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save state to localStorage", err);
    }
  }, [state, hydrated]);

  const currentUser = useMemo(
    () => {
      if (!state.currentUserId) return null;
      return state.users.find((u) => u.id === state.currentUserId) ?? null;
    },
    [state.users, state.currentUserId]
  );

  const currentGuide = useMemo(
    () => {
      if (!state.currentGuideId) return null;
      return state.guides.find((g) => g.id === state.currentGuideId) ?? null;
    },
    [state.guides, state.currentGuideId]
  );

  const login = useCallback(
    (identifier: string, password: string) => {
      const id = identifier.trim().toLowerCase();
      const pwd = password.trim();
      const user = state.users.find((u) => {
        const uEmail = (u.email || "").trim().toLowerCase();
        const uMobile = (u.mobile || "").trim();
        const matchesId = uEmail === id || (uMobile.length > 0 && uMobile === identifier.trim());
        return matchesId && u.password === pwd;
      });
      if (!user) return "Invalid email/mobile or password. Please check your credentials.";
      setState((s) => ({
        ...s,
        currentUserId: user.id,
        currentGuideId: null,
        userRole: "traveler",
      }));
      return null;
    },
    [state.users]
  );

  const loginAsGuide = useCallback(
    (identifier: string, password: string) => {
      const id = identifier.trim().toLowerCase();
      const guide = state.guides.find(
        (g) =>
          ((g.email && g.email.toLowerCase() === id) || (g.mobile && g.mobile === identifier.trim())) &&
          g.password === password
      );
      if (!guide) return "Check your guide email/mobile and password.";
      setState((s) => ({
        ...s,
        currentUserId: null,
        currentGuideId: guide.id,
        userRole: "guide",
      }));
      return null;
    },
    [state.guides]
  );

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      currentUserId: null,
      currentGuideId: null,
      userRole: null,
    }));
  }, []);

  const signup = useCallback((input: Parameters<Store["signup"]>[0]) => {
    const normEmail = input.email.trim().toLowerCase();
    const normMobile = input.mobile.trim();
    const trimmedName = input.name.trim();

    if (!trimmedName) return "Please enter your full name.";
    if (!normEmail) return "Please enter a valid email address.";
    if (!input.password || input.password.trim().length < 4) return "Password must be at least 4 characters.";

    const exists = state.users.some((u) => {
      const uEmail = (u.email || "").trim().toLowerCase();
      const uMobile = (u.mobile || "").trim();
      return uEmail === normEmail || (normMobile.length > 0 && uMobile === normMobile);
    });

    if (exists) return "An account with this email or mobile already exists. Please log in.";

    const id = uid("u");
    const user: User = {
      ...input,
      id,
      name: trimmedName,
      email: normEmail,
      mobile: normMobile,
      city: input.city ? input.city.trim() : "Pune",
      password: input.password.trim(),
      verificationStatus: "unverified",
      profilePhoto: "",
      travelPhotos: [],
      previousTrips: [],
      completedTripIds: [],
      rating: 5.0,
      completedTripCount: 0,
      blockedUserIds: [],
      savedTripIds: [],
      reportedUserIds: [],
      bio: "New on TravelMate.",
      compatibilityAnswers: {
        q1_destination: "Mountains",
        q2_idealTrip: "Exploring and sightseeing",
        q3_activities: ["Sightseeing", "Photography", "Hiking"],
        q4_budget: "Moderate",
        q5_pace: "Balanced",
        q6_social: "Quite social",
        q7_travelWith: "Small group",
        q8_accommodation: "Comfortable hotel",
        q9_topPriorities: ["Safety", "Comfort", "Scenic beauty"],
        q10_activeTime: "Flexible",
        q11_spontaneous: "Balanced planning",
        q12_transit: "Cab or car",
        q13_food: "Local and street food",
        q14_personalSpace: "Some alone time",
        q15_companionStyle: "Easy-going",
      },
      travelPersonality: {
        title: "Explorer",
        emoji: "🧭",
        scores: { adventure: 75, social: 75, planning: 75, comfort: 75, spontaneity: 75 },
      },
    };

    setState((s) => ({
      ...s,
      users: [...s.users, user],
      currentUserId: id,
      currentGuideId: null,
      userRole: "traveler",
    }));
    return null;
  }, [state.users]);

  const signupAsGuide = useCallback((input: Parameters<Store["signupAsGuide"]>[0]) => {
    const exists = state.guides.some(
      (g) => (g.email && g.email.toLowerCase() === input.email?.toLowerCase()) || (g.mobile && g.mobile === input.mobile)
    );
    if (exists) return "A guide account with this email or mobile already exists.";
    const id = uid("g_guide");
    const guide: Guide = {
      ...input,
      id,
      rating: 5.0,
      verifiedTrips: 0,
      verificationStatus: "verified",
      answers: {
        q1_destination: "Mountains",
        q2_idealTrip: "Adventurous",
        q3_activities: ["Trekking", "Camping", "Photography"],
        q4_budget: "Moderate",
        q5_pace: "Balanced",
        q6_social: "Quite social",
        q7_travelWith: "Small group",
        q8_accommodation: "Homestay",
        q9_topPriorities: ["Safety", "Adventure", "Nature"],
        q10_activeTime: "Early morning",
        q11_spontaneous: "Usually okay with them",
        q12_transit: "Cab or car",
        q13_food: "Local and street food",
        q14_personalSpace: "Some alone time every day",
        q15_companionStyle: "Adventurous",
      },
    };
    setState((s) => ({
      ...s,
      guides: [...s.guides, guide],
      currentGuideId: id,
      currentUserId: null,
      userRole: "guide",
    }));
    return null;
  }, [state.guides]);

  const verifyCurrentUser = useCallback(() => {
    if (!state.currentUserId) return;
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, verificationStatus: "verified" } : u)),
    }));
  }, [state.currentUserId]);

  const completeQuiz = useCallback((answers: CompatibilityAnswers) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === s.currentUserId
          ? { ...u, compatibilityAnswers: answers, travelPersonality: buildPersonality(answers) }
          : u
      ),
    }));
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setState((s) => {
      if (s.currentGuideId && !s.currentUserId) {
        return {
          ...s,
          guides: s.guides.map((g) =>
            g.id === s.currentGuideId
              ? {
                  ...g,
                  photo: patch.profilePhoto !== undefined ? patch.profilePhoto : g.photo,
                  bio: patch.bio !== undefined ? patch.bio : g.bio,
                  name: patch.name !== undefined ? patch.name : g.name,
                  location: patch.city !== undefined ? patch.city : g.location,
                }
              : g
          ),
        };
      }
      if (!s.currentUserId) return s;
      return {
        ...s,
        users: s.users.map((u) => {
          if (u.id !== s.currentUserId) return u;
          const updated: User = {
            ...u,
            ...patch,
            id: u.id,
            email: u.email,
          };
          if (patch.compatibilityAnswers) {
            updated.compatibilityAnswers = {
              ...(u.compatibilityAnswers || {}),
              ...patch.compatibilityAnswers,
            };
            updated.travelPersonality = buildPersonality(updated.compatibilityAnswers);
          }
          return updated;
        }),
      };
    });
  }, []);

  const addTravelPhotos = useCallback(
    (newPhotos: { url: string; caption?: string; destination?: string; tripDate?: string }[]) => {
      setState((s) => {
        if (!s.currentUserId) return s;
        const items: TravelPhoto[] = newPhotos.map((p) => ({
          id: uid("tp"),
          url: p.url,
          caption: p.caption || "",
          destination: p.destination || "",
          tripDate: p.tripDate || "",
          uploadedAt: new Date().toISOString(),
        }));
        return {
          ...s,
          users: s.users.map((u) =>
            u.id === s.currentUserId
              ? { ...u, travelPhotos: [...(u.travelPhotos || []), ...items] }
              : u
          ),
        };
      });
    },
    []
  );

  const deleteTravelPhoto = useCallback((photoId: string) => {
    setState((s) => {
      if (!s.currentUserId) return s;
      return {
        ...s,
        users: s.users.map((u) =>
          u.id === s.currentUserId
            ? { ...u, travelPhotos: (u.travelPhotos || []).filter((p) => p.id !== photoId) }
            : u
        ),
      };
    });
  }, []);

  const saveTrip = useCallback((tripId: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id !== s.currentUserId) return u;
        const saved = u.savedTripIds.includes(tripId)
          ? u.savedTripIds.filter((id) => id !== tripId)
          : [...u.savedTripIds, tripId];
        return { ...u, savedTripIds: saved };
      }),
    }));
  }, []);

  const createTrip = useCallback((input: Parameters<Store["createTrip"]>[0]) => {
    const creatorId = state.currentUserId || "u_guest";
    const initialMembers = input.initialMembers || [creatorId];
    const memberIds = [...new Set([creatorId, ...initialMembers])];
    const inviteUserIds = input.inviteUserIds || [];

    const trip: Trip = {
      itinerary: input.itinerary ?? [
        { day: "Day 1", title: "Arrival & Orientation", details: "Travel, hotel check-in and local overview." },
        { day: "Last Day", title: "Wrap-up & Departure", details: "Checkout, farewell and return." },
      ],
      rules: input.rules ?? ["Transparent expense sharing", "Punctual departures", "Safety awareness"],
      photos: [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      ],
      ...input,
      id: uid("t"),
      creatorId,
      status: memberIds.length >= input.groupSize ? "confirmed" : "forming",
    };

    const isFull = memberIds.length >= input.groupSize;
    const group: Group = {
      id: uid("g"),
      tripId: trip.id,
      creatorId,
      memberIds,
      pendingInviteIds: [...new Set(inviteUserIds)],
      joinRequestIds: [],
      recruiting: !isFull, // Auto ON if not full!
      groupJoinRequests: [],
    };

    const newInvites: Invitation[] = inviteUserIds.map((uId) => ({
      id: uid("inv"),
      groupId: group.id,
      tripId: trip.id,
      senderId: creatorId,
      fromUserId: creatorId,
      invitedUserId: uId,
      toUserId: uId,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }));

    setState((s) => ({
      ...s,
      trips: [...s.trips, trip],
      groups: [...s.groups, group],
      invitations: [...(s.invitations || []), ...newInvites],
    }));
    return { trip, group };
  }, [state.currentUserId]);

  const toggleGroupRecruiting = useCallback((groupId: string, explicitState?: boolean) => {
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) => {
        if (g.id !== groupId) return g;
        const trip = s.trips.find((t) => t.id === g.tripId);
        const max = trip?.groupSize ?? 5;
        if (g.memberIds.length >= max) {
          return { ...g, recruiting: false }; // Full group cannot recruit
        }
        return { ...g, recruiting: explicitState !== undefined ? explicitState : !g.recruiting };
      }),
    }));
  }, []);

  const inviteTraveler = useCallback(
    (groupId: string, userId: string): { success: boolean; message: string } => {
      if (!state.currentUserId) return { success: false, message: "Please log in first." };
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return { success: false, message: "Group not found." };
      const trip = state.trips.find((t) => t.id === group.tripId);
      const max = trip?.groupSize ?? 5;

      if (group.memberIds.length >= max) {
        return { success: false, message: "Group is already full." };
      }
      if (group.memberIds.includes(userId)) {
        return { success: false, message: "Traveler is already a member of this group." };
      }
      const hasPending = (state.invitations || []).some(
        (inv) =>
          inv.groupId === groupId &&
          (inv.toUserId === userId || inv.invitedUserId === userId) &&
          inv.status === "pending"
      );
      if (hasPending || group.pendingInviteIds.includes(userId)) {
        return { success: false, message: "Invitation already sent." };
      }

      const invitation = {
        id: uid("inv"),
        groupId,
        tripId: group.tripId,
        senderId: state.currentUserId,
        fromUserId: state.currentUserId,
        invitedUserId: userId,
        toUserId: userId,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        groups: s.groups.map((g) =>
          g.id === groupId ? { ...g, pendingInviteIds: [...new Set([...g.pendingInviteIds, userId])] } : g
        ),
        invitations: [...(s.invitations || []), invitation],
      }));

      return { success: true, message: "Invitation sent." };
    },
    [state.currentUserId, state.groups, state.trips, state.invitations]
  );

  const respondInvite = useCallback(
    (invitationId: string, accept: boolean): { success: boolean; message: string } => {
      const inv = (state.invitations || []).find((i) => i.id === invitationId);
      if (!inv) return { success: false, message: "Invitation not found." };
      const targetUserId = inv.toUserId || inv.invitedUserId;
      const group = state.groups.find((g) => g.id === inv.groupId);
      if (!group) return { success: false, message: "Group not found." };
      const trip = state.trips.find((t) => t.id === group.tripId);
      const max = trip?.groupSize ?? 5;

      if (accept && group.memberIds.length >= max) {
        return { success: false, message: "Group is already full." };
      }

      setState((s) => {
        const updatedInv = (s.invitations || []).map((i) =>
          i.id === invitationId ? { ...i, status: accept ? ("accepted" as const) : ("declined" as const) } : i
        );
        const targetGroup = s.groups.find((g) => g.id === inv.groupId);
        if (!targetGroup) return { ...s, invitations: updatedInv };

        const pendingInviteIds = targetGroup.pendingInviteIds.filter((id) => id !== targetUserId);
        const memberIds =
          accept && !targetGroup.memberIds.includes(targetUserId)
            ? [...targetGroup.memberIds, targetUserId]
            : targetGroup.memberIds;
        const isFull = memberIds.length >= max;
        const userName = s.users.find((u) => u.id === targetUserId)?.name ?? "A traveler";

        return {
          ...s,
          invitations: updatedInv,
          groups: s.groups.map((g) =>
            g.id === inv.groupId
              ? {
                  ...g,
                  pendingInviteIds,
                  memberIds,
                  recruiting: isFull ? false : g.recruiting,
                }
              : g
          ),
          messages: accept
            ? [
                ...s.messages,
                {
                  id: uid("m"),
                  senderId: "system",
                  groupId: inv.groupId,
                  message: `${userName} accepted the invitation and joined the group. (${memberIds.length}/${max} members)`,
                  timestamp: new Date().toISOString(),
                  type: "system" as const,
                },
              ]
            : s.messages,
        };
      });

      return {
        success: true,
        message: accept ? "Invitation accepted. You are now a group member!" : "Invitation declined.",
      };
    },
    [state.invitations, state.groups, state.trips]
  );

  const requestJoin = useCallback((groupId: string) => {
    if (!state.currentUserId) return { success: false, message: "Please log in first." };
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return { success: false, message: "Group not found." };
    const trip = state.trips.find((t) => t.id === group.tripId);
    const max = trip?.groupSize ?? 5;

    if (group.memberIds.length >= max) {
      return { success: false, message: "Group is full." };
    }
    if (group.memberIds.includes(state.currentUserId)) {
      return { success: false, message: "You are already a member of this group." };
    }
    if (group.joinRequestIds.includes(state.currentUserId)) {
      return { success: false, message: "Join request already sent." };
    }

    setState((s) => ({
      ...s,
      groups: s.groups.map((g) =>
        g.id === groupId ? { ...g, joinRequestIds: [...g.joinRequestIds, s.currentUserId!] } : g
      ),
    }));
    return { success: true, message: "Join request sent." };
  }, [state.currentUserId, state.groups, state.trips]);

  const requestJoinWithGroup = useCallback(
    (
      groupId: string,
      info: {
        groupName: string;
        size: number;
        memberNames: string[];
        destination: string;
        dates: string;
        budget: string;
        interests: string[];
      }
    ) => {
      if (!state.currentUserId) return { success: false, message: "Please log in first." };
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return { success: false, message: "Group not found." };
      const trip = state.trips.find((t) => t.id === group.tripId);
      const max = trip?.groupSize ?? 5;
      const available = max - group.memberIds.length;

      if (info.size > available) {
        return {
          success: false,
          message: `Cannot join with ${info.size} people. Only ${available} slot${available === 1 ? "" : "s"} left.`,
        };
      }

      // Check duplicate
      const hasPending = (state.groupJoinRequests || []).some(
        (r) => r.groupId === groupId && r.fromUserId === state.currentUserId && r.status === "pending"
      );
      if (hasPending) {
        return { success: false, message: "Group join request already pending." };
      }

      const req: GroupJoinRequest = {
        id: uid("gjr"),
        groupId,
        fromUserId: state.currentUserId,
        fromUserName: state.users.find((u) => u.id === state.currentUserId)?.name || "Traveler",
        fromUserPhoto: state.users.find((u) => u.id === state.currentUserId)?.profilePhoto,
        type: "group",
        travelersCount: info.size,
        memberNames: info.memberNames,
        destination: info.destination,
        dates: info.dates,
        budget: info.budget,
        interests: info.interests,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        groupJoinRequests: [...(s.groupJoinRequests || []), req],
      }));
      return { success: true, message: "Group join request sent." };
    },
    [state.currentUserId, state.groups, state.trips, state.users, state.groupJoinRequests]
  );

  const respondJoin = useCallback((groupId: string, userId: string, accept: boolean) => {
    setState((s) => {
      const group = s.groups.find((g) => g.id === groupId);
      if (!group) return s;
      const trip = s.trips.find((t) => t.id === group.tripId);
      const max = trip?.groupSize ?? 5;

      const joinRequestIds = group.joinRequestIds.filter((id) => id !== userId);
      let memberIds = group.memberIds;
      if (accept && !group.memberIds.includes(userId)) {
        if (memberIds.length < max) {
          memberIds = [...memberIds, userId];
        }
      }

      const isFull = memberIds.length >= max;
      const userName = s.users.find((u) => u.id === userId)?.name ?? "A traveler";

      return {
        ...s,
        groups: s.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                joinRequestIds,
                memberIds,
                recruiting: isFull ? false : g.recruiting,
              }
            : g
        ),
        messages: accept
          ? [
              ...s.messages,
              {
                id: uid("m"),
                senderId: "system",
                groupId,
                message: `${userName} was accepted into the group. (${memberIds.length}/${max} members)`,
                timestamp: new Date().toISOString(),
                type: "system" as const,
              },
            ]
          : s.messages,
      };
    });
  }, []);

  const respondGroupJoinRequest = useCallback(
    (requestId: string, accept: boolean) => {
      const req = (state.groupJoinRequests || []).find((r) => r.id === requestId);
      if (!req) return { success: false, message: "Request not found." };
      const group = state.groups.find((g) => g.id === req.groupId);
      if (!group) return { success: false, message: "Group not found." };
      const trip = state.trips.find((t) => t.id === group.tripId);
      const max = trip?.groupSize ?? 5;
      const available = max - group.memberIds.length;

      if (accept && req.travelersCount > available) {
        return {
          success: false,
          message: `Cannot accept ${req.travelersCount} members. Only ${available} slot${available === 1 ? "" : "s"} left.`,
        };
      }

      setState((s) => {
        // Add member IDs for the group members
        const newMemberIds = [...group.memberIds];
        if (accept) {
          if (!newMemberIds.includes(req.fromUserId)) {
            newMemberIds.push(req.fromUserId);
          }
          // If there are other named members, add or mock their inclusion
          req.memberNames.forEach((name, idx) => {
            const extraId = `u_companion_${req.id}_${idx}`;
            if (!newMemberIds.includes(extraId) && newMemberIds.length < max) {
              newMemberIds.push(extraId);
            }
          });
        }

        const isFull = newMemberIds.length >= max;

        return {
          ...s,
          groupJoinRequests: (s.groupJoinRequests || []).map((r) =>
            r.id === requestId ? { ...r, status: accept ? "accepted" : "rejected" } : r
          ),
          groups: s.groups.map((g) =>
            g.id === req.groupId
              ? {
                  ...g,
                  memberIds: newMemberIds,
                  recruiting: isFull ? false : g.recruiting,
                }
              : g
          ),
          messages: accept
            ? [
                ...s.messages,
                {
                  id: uid("m"),
                  senderId: "system",
                  groupId: req.groupId,
                  message: `${req.fromUserName}'s group (${req.travelersCount} travelers) joined. (${newMemberIds.length}/${max} members)`,
                  timestamp: new Date().toISOString(),
                  type: "system" as const,
                },
              ]
            : s.messages,
        };
      });

      return { success: true, message: accept ? "Group accepted." : "Group request declined." };
    },
    [state.groupJoinRequests, state.groups, state.trips]
  );

  const removeMember = useCallback((groupId: string, userId: string) => {
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) => {
        if (g.id !== groupId) return g;
        const memberIds = g.memberIds.filter((id) => id !== userId);
        return { ...g, memberIds, recruiting: true }; // Reopen recruiting if slot opened
      }),
    }));
  }, []);

  const updateTrip = useCallback((tripId: string, patch: Partial<Trip>) => {
    setState((s) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, ...patch, id: t.id } : t)),
    }));
  }, []);

  const getDmConversationId = useCallback((userA: string, userB: string) => {
    return `dm_${[userA, userB].sort().join("_")}`;
  }, []);

  const sendMessage = useCallback(
    (groupId: string, message: string, type: Message["type"] = "text", recipientId?: string) => {
      if (!message.trim()) return;
      const sender = state.currentUserId || state.currentGuideId || "guest";
      const msg: Message = {
        id: uid("m"),
        senderId: type === "system" ? "system" : sender,
        groupId,
        conversationId: groupId,
        recipientId,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        type,
        readBy: [sender],
      };
      setState((s) => ({ ...s, messages: [...s.messages, msg] }));
    },
    [state.currentUserId, state.currentGuideId]
  );

  const markMessagesAsRead = useCallback((conversationId: string) => {
    const actorId = state.currentUserId || state.currentGuideId;
    if (!actorId) return;
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        (m.groupId === conversationId || m.conversationId === conversationId) &&
        (!m.readBy || !m.readBy.includes(actorId))
          ? { ...m, readBy: [...(m.readBy || []), actorId] }
          : m
      ),
    }));
  }, [state.currentUserId, state.currentGuideId]);

  const requestGuide = useCallback(
    (
      guideId: string,
      tripDetails?: {
        destination: string;
        dates: string;
        budget: string | number;
        interests: string[];
        travelersCount: number;
        notes?: string;
        groupId?: string;
      }
    ) => {
      const userId = state.currentUserId || "u_riya";
      const traveler = state.users.find((u) => u.id === userId);
      const travelerName = traveler?.name || "Traveler";
      const travelerPhoto = traveler?.profilePhoto;

      // Duplicate prevention
      const existing = (state.guideRequests || []).find(
        (gr) => gr.guideId === guideId && gr.fromUserId === userId && gr.status === "pending"
      );
      if (existing) {
        return { success: false, message: "A request is already pending with this guide." };
      }

      // Look up group or default to active
      const groupId = tripDetails?.groupId || state.groups.find((g) => g.memberIds.includes(userId))?.id || "g_manali";
      const group = state.groups.find((g) => g.id === groupId);
      const trip = state.trips.find((t) => t.id === group?.tripId);

      const guideReq: GuideRequest = {
        id: uid("gr"),
        groupId,
        tripId: trip?.id || "t_manali",
        guideId,
        fromUserId: userId,
        travelerName,
        travelerPhoto,
        destination: tripDetails?.destination || trip?.destination || "Manali",
        dates: tripDetails?.dates || (trip ? `${trip.startDate} → ${trip.endDate}` : "Upcoming"),
        budget: tripDetails?.budget || (trip ? `${trip.budgetMin}–${trip.budgetMax}` : "₹15,000"),
        interests: tripDetails?.interests || trip?.activities || ["Trekking", "Sightseeing"],
        travelersCount: tripDetails?.travelersCount || group?.memberIds.length || 2,
        notes: tripDetails?.notes || "We would like to request your guidance for our trip.",
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        guideRequests: [...(s.guideRequests || []), guideReq],
        messages: [
          ...s.messages,
          {
            id: uid("m"),
            senderId: "system",
            groupId,
            message: `Guide request sent to ${s.guides.find((g) => g.id === guideId)?.name ?? "guide"}.`,
            timestamp: new Date().toISOString(),
            type: "system" as const,
          },
        ],
      }));

      return { success: true, message: "Request sent successfully to guide." };
    },
    [state.currentUserId, state.guideRequests, state.groups, state.trips, state.users]
  );

  const respondGuideRequest = useCallback(
    (requestId: string, accept: boolean) => {
      const req = (state.guideRequests || []).find((r) => r.id === requestId);
      if (!req) return { success: false, message: "Request not found." };

      setState((s) => {
        const guide = s.guides.find((g) => g.id === req.guideId);
        const guideName = guide?.name || "The guide";

        return {
          ...s,
          guideRequests: (s.guideRequests || []).map((r) =>
            r.id === requestId ? { ...r, status: accept ? "accepted" : "rejected" } : r
          ),
          trips: accept
            ? s.trips.map((t) => (t.id === req.tripId ? { ...t, guideId: req.guideId } : t))
            : s.trips,
          groups: accept && req.groupId
            ? s.groups.map((g) =>
                g.id === req.groupId && !g.memberIds.includes(req.guideId)
                  ? { ...g, memberIds: [...g.memberIds, req.guideId] }
                  : g
              )
            : s.groups,
          messages: accept && req.groupId
            ? [
                ...s.messages,
                {
                  id: uid("m"),
                  senderId: "system",
                  groupId: req.groupId,
                  message: `${guideName} accepted the guide request. Chat is now open!`,
                  timestamp: new Date().toISOString(),
                  type: "system" as const,
                },
              ]
            : s.messages,
        };
      });

      return {
        success: true,
        message: accept ? "Request accepted. You are now attached to the trip." : "Request declined.",
        groupId: req.groupId,
      };
    },
    [state.guideRequests]
  );

  const assignGuide = useCallback((tripId: string, guideId: string) => {
    setState((s) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, guideId } : t)),
    }));
  }, []);

  const canReview = useCallback(
    (reviewerId: string, reviewedId: string, tripId: string, isGuide = false) => {
      const trip = state.trips.find((t) => t.id === tripId);
      const group = state.groups.find((g) => g.tripId === tripId);
      if (!trip || trip.status !== "completed") return false;
      if (isGuide) {
        return Boolean(group?.memberIds.includes(reviewerId) && trip.guideId === reviewedId);
      }
      return Boolean(
        group?.memberIds.includes(reviewerId) &&
          group.memberIds.includes(reviewedId) &&
          reviewerId !== reviewedId
      );
    },
    [state.trips, state.groups]
  );

  const addReview = useCallback(
    (input: Omit<Review, "id" | "verifiedTrip">) => {
      if (!canReview(input.reviewerId, input.reviewedUserId, input.tripId, input.isGuideReview)) {
        return "Reviews are only allowed after a shared completed trip.";
      }
      const exists = state.reviews.some(
        (r) =>
          r.reviewerId === input.reviewerId &&
          r.reviewedUserId === input.reviewedUserId &&
          r.tripId === input.tripId
      );
      if (exists) return "You already reviewed this person for this trip.";
      const review: Review = { ...input, id: uid("r"), verifiedTrip: true };
      setState((s) => ({ ...s, reviews: [...s.reviews, review] }));
      return null;
    },
    [canReview, state.reviews]
  );

  const blockUser = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === s.currentUserId ? { ...u, blockedUserIds: [...new Set([...u.blockedUserIds, userId])] } : u
      ),
    }));
  }, []);

  const reportUser = useCallback((userId: string, reason: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === s.currentUserId
          ? {
              ...u,
              reportedUserIds: [...new Set([...u.reportedUserIds, userId])],
              blockedUserIds: [...new Set([...u.blockedUserIds, userId])],
            }
          : u
      ),
    }));
    console.info("Report lodged:", { userId, reason });
  }, []);

  const compatibilityWith = useCallback(
    (userId: string) => {
      if (!currentUser) return null;
      const other = state.users.find((u) => u.id === userId);
      if (!other) return null;
      return compareUsers(currentUser, other);
    },
    [currentUser, state.users]
  );

  const compatibilityWithTrip = useCallback(
    (tripId: string) => {
      if (!currentUser) return null;
      const trip = state.trips.find((t) => t.id === tripId);
      if (!trip) return null;
      const creator = state.users.find((u) => u.id === trip.creatorId);
      return compareUserToTrip(currentUser, trip, creator);
    },
    [currentUser, state.trips, state.users]
  );

  const exploreTrips = useCallback(
    (filters: Partial<ExploreFilters>) => {
      const blocked = new Set(currentUser?.blockedUserIds ?? []);
      return state.trips
        .filter((t) => t.status !== "completed" && t.status !== "cancelled")
        .filter((t) => tripMatchesFilters(t, filters))
        .map((trip) => {
          const group = state.groups.find((g) => g.tripId === trip.id);
          const creator = state.users.find((u) => u.id === trip.creatorId);
          const score = currentUser ? compareUserToTrip(currentUser, trip, creator) : null;
          return { trip, group, score };
        })
        .filter((row): row is { trip: Trip; group: Group; score: CompatibilityBreakdown | null } => {
          if (!row.group) return false;
          if (blocked.has(row.trip.creatorId)) return false;
          // If onlyRecruiting filter is specified, check recruiting flag and available slots
          if (filters.onlyRecruiting) {
            const isFull = row.group.memberIds.length >= row.trip.groupSize;
            if (!row.group.recruiting || isFull) return false;
          }
          return true;
        })
        .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));
    },
    [state.trips, state.groups, state.users, currentUser]
  );

  const recommendedTravelers = useCallback(() => {
    if (!currentUser?.compatibilityAnswers) {
      // Return other users with baseline compatibility breakdown
      return state.users
        .filter((u) => u.id !== currentUser?.id)
        .map((user) => ({
          user,
          score: {
            overall: 80,
            highlights: ["Flexible travel style", "Open dates"],
            penalties: [],
            matches: ["Similar travel interests"],
            differences: [],
          },
        }));
    }
    const blocked = new Set(currentUser.blockedUserIds);
    return state.users
      .filter((u) => u.id !== currentUser.id && !blocked.has(u.id))
      .map((user) => ({ user, score: compareUsers(currentUser, user)! }))
      .filter((x) => Boolean(x.score))
      .sort((a, b) => b.score.overall - a.score.overall);
  }, [currentUser, state.users]);

  // Trip Planner Methods
  const activePlan = useMemo(() => {
    if (!state.tripPlans?.length) return null;
    if (activePlanId) {
      return state.tripPlans.find((p) => p.id === activePlanId) ?? state.tripPlans[0];
    }
    if (state.currentUserId) {
      const userPlan = state.tripPlans.find((p) => p.userId === state.currentUserId);
      if (userPlan) return userPlan;
    }
    return state.tripPlans[0];
  }, [state.tripPlans, activePlanId, state.currentUserId]);

  const createTripPlan = useCallback((input: Omit<TripPlan, "id">) => {
    const newPlan: TripPlan = { ...input, id: uid("plan") };
    setState((s) => ({
      ...s,
      tripPlans: [...(s.tripPlans || []), newPlan],
    }));
    setActivePlanId(newPlan.id);
    return newPlan;
  }, []);

  const updateTripPlan = useCallback((planId: string, patch: Partial<TripPlan>) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) => (p.id === planId ? { ...p, ...patch } : p)),
    }));
  }, []);

  const addPlannerActivity = useCallback((planId: string, activity: Omit<TripPlan["activities"][0], "id">) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId
          ? { ...p, activities: [...p.activities, { ...activity, id: uid("act") }] }
          : p
      ),
    }));
  }, []);

  const updatePlannerActivity = useCallback((planId: string, activityId: string, patch: Partial<TripPlan["activities"][0]>) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId
          ? {
              ...p,
              activities: p.activities.map((a) => (a.id === activityId ? { ...a, ...patch } : a)),
            }
          : p
      ),
    }));
  }, []);

  const deletePlannerActivity = useCallback((planId: string, activityId: string) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId
          ? { ...p, activities: p.activities.filter((a) => a.id !== activityId) }
          : p
      ),
    }));
  }, []);

  const addPlannerBooking = useCallback((planId: string, booking: Omit<TripPlan["bookings"][0], "id">) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId ? { ...p, bookings: [...p.bookings, { ...booking, id: uid("bk") }] } : p
      ),
    }));
  }, []);

  const updatePlannerBooking = useCallback((planId: string, bookingId: string, patch: Partial<TripPlan["bookings"][0]>) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId
          ? {
              ...p,
              bookings: p.bookings.map((b) => (b.id === bookingId ? { ...b, ...patch } : b)),
            }
          : p
      ),
    }));
  }, []);

  const deletePlannerBooking = useCallback((planId: string, bookingId: string) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId ? { ...p, bookings: p.bookings.filter((b) => b.id !== bookingId) } : p
      ),
    }));
  }, []);

  const addPlannerLocation = useCallback((planId: string, loc: Omit<TripPlan["locations"][0], "id">) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId ? { ...p, locations: [...p.locations, { ...loc, id: uid("loc") }] } : p
      ),
    }));
  }, []);

  const updatePlannerLocation = useCallback((planId: string, locationId: string, patch: Partial<TripPlan["locations"][0]>) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId
          ? {
              ...p,
              locations: p.locations.map((l) => (l.id === locationId ? { ...l, ...patch } : l)),
            }
          : p
      ),
    }));
  }, []);

  const deletePlannerLocation = useCallback((planId: string, locId: string) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId ? { ...p, locations: p.locations.filter((l) => l.id !== locId) } : p
      ),
    }));
  }, []);

  const addPlannerExpense = useCallback((planId: string, exp: Omit<TripPlan["expenses"][0], "id">) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId ? { ...p, expenses: [...p.expenses, { ...exp, id: uid("exp") }] } : p
      ),
    }));
  }, []);

  const updatePlannerExpense = useCallback((planId: string, expenseId: string, patch: Partial<TripPlan["expenses"][0]>) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId
          ? {
              ...p,
              expenses: p.expenses.map((e) => (e.id === expenseId ? { ...e, ...patch } : e)),
            }
          : p
      ),
    }));
  }, []);

  const deletePlannerExpense = useCallback((planId: string, expId: string) => {
    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((p) =>
        p.id === planId ? { ...p, expenses: p.expenses.filter((e) => e.id !== expId) } : p
      ),
    }));
  }, []);

  const generateDayPlan = useCallback((planId: string, prompt: string) => {
    const p = prompt.toLowerCase();
    const isRelaxed = p.includes("relax") || p.includes("cafe") || p.includes("quiet");
    const isAdventure = p.includes("trek") || p.includes("hike") || p.includes("adventure") || p.includes("raft");

    const suggestedDay = 4;
    const newActs = isRelaxed
      ? [
          { id: uid("act"), day: suggestedDay, time: "10:00", title: "Slow brunch at local cafe", details: "Artisanal coffee and bakery breakfast", category: "food" as const },
          { id: uid("act"), day: suggestedDay, time: "12:30", title: "Riverside walk & scenic reading", details: "Relaxed stroll along nature trail", category: "sightseeing" as const },
          { id: uid("act"), day: suggestedDay, time: "16:00", title: "Handicrafts & heritage shops", details: "Explore traditional local stores", category: "activity" as const },
          { id: uid("act"), day: suggestedDay, time: "19:30", title: "Fireside dinner", details: "Cozy dinner with local specialties", category: "food" as const },
        ]
      : isAdventure
      ? [
          { id: uid("act"), day: suggestedDay, time: "07:30", title: "Early morning trailhead departure", details: "Pack energy snacks and water", category: "transport" as const },
          { id: uid("act"), day: suggestedDay, time: "09:00", title: "Summit / Ridge hike", details: "4-hour guided uphill trek with panoramic valley view", category: "activity" as const },
          { id: uid("act"), day: suggestedDay, time: "14:00", title: "Mountain stream picnic", details: "Outdoor lunch break by crystal stream", category: "food" as const },
          { id: uid("act"), day: suggestedDay, time: "17:30", title: "Descend & campsite relaxation", details: "Stretch, unpack gear, and evening chai", category: "sightseeing" as const },
        ]
      : [
          { id: uid("act"), day: suggestedDay, time: "09:30", title: "Morning landmark visit", details: "Explore historic site and architectural highlights", category: "sightseeing" as const },
          { id: uid("act"), day: suggestedDay, time: "13:00", title: "Traditional local lunch", details: "Authentic regional cuisine at recommended eatery", category: "food" as const },
          { id: uid("act"), day: suggestedDay, time: "15:30", title: "Cultural walking tour", details: "Visit local art centers and market alleys", category: "activity" as const },
          { id: uid("act"), day: suggestedDay, time: "19:00", title: "Sunset viewpoint & group dinner", details: "Golden hour photo spot followed by shared meal", category: "food" as const },
        ];

    setState((s) => ({
      ...s,
      tripPlans: (s.tripPlans || []).map((plan) =>
        plan.id === planId ? { ...plan, activities: [...plan.activities, ...newActs] } : plan
      ),
    }));
  }, []);

  const value: Store = {
    ...state,
    hydrated,
    currentUser,
    currentGuide,
    login,
    loginAsGuide,
    logout,
    signup,
    signupAsGuide,
    verifyCurrentUser,
    completeQuiz,
    updateProfile,
    addTravelPhotos,
    deleteTravelPhoto,
    saveTrip,
    createTrip,
    toggleGroupRecruiting,
    inviteTraveler,
    respondInvite,
    requestJoin,
    requestJoinWithGroup,
    respondJoin,
    respondGroupJoinRequest,
    removeMember,
    updateTrip,
    sendMessage,
    getDmConversationId,
    markMessagesAsRead,
    requestGuide,
    respondGuideRequest,
    assignGuide,
    addReview,
    blockUser,
    reportUser,
    canReview,
    compatibilityWith,
    compatibilityWithTrip,
    exploreTrips,
    recommendedTravelers,
    activePlan,
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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function guideCompatibility(me: User | null, guide: Guide) {
  if (!me?.compatibilityAnswers) return null;
  return compareAnswers(me.compatibilityAnswers, guide.answers);
}
