export type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";

export interface CompatibilityAnswers {
  q1_destination: string;
  q2_idealTrip: string;
  q3_activities: string[];
  q4_budget: string;
  q5_pace: string;
  q6_social: string;
  q7_travelWith: string;
  q8_accommodation: string;
  q9_topPriorities: string[];
  q10_activeTime: string;
  q11_spontaneous: string;
  q12_transit: string;
  q13_food: string;
  q14_personalSpace: string;
  q15_companionStyle: string;

  // Additional display/filter attributes
  activities?: string[];
  terrain?: string;
  tripType?: string;
  idealTrip?: string;
  q15_companion?: string;
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface Invitation {
  id: string;
  groupId: string;
  senderId: string;
  invitedUserId: string;
  toUserId?: string;
  fromUserId?: string;
  tripId?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface PersonalityScores {
  adventure: number;
  social: number;
  planning: number;
  comfort: number;
  spontaneity: number;
}

export interface TravelPersonality {
  title: string;
  emoji: string;
  scores: PersonalityScores;
}

export interface PreviousTrip {
  id: string;
  destination: string;
  month: string;
  description: string;
  activities: string[];
  photos: string[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface TravelPhoto {
  id: string;
  url: string;
  caption?: string;
  destination?: string;
  tripDate?: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  city: string;
  email: string;
  mobile: string;
  password: string;
  verificationStatus: "unverified" | "verified";
  profilePhoto: string;
  travelPhotos?: TravelPhoto[];
  bio: string;
  travelPersonality?: TravelPersonality;
  compatibilityAnswers?: CompatibilityAnswers;
  previousTrips: PreviousTrip[];
  completedTripIds: string[];
  rating: number;
  completedTripCount: number;
  emergencyContact?: EmergencyContact;
  blockedUserIds: string[];
  savedTripIds: string[];
  reportedUserIds: string[];
}

export interface ItineraryDay {
  day: string;
  title: string;
  details: string;
}

export type TripStatus = "planning" | "forming" | "confirmed" | "completed" | "cancelled";

export interface Trip {
  id: string;
  creatorId: string;
  destination: string;
  startDate: string;
  endDate: string;
  startingLocation: string;
  budgetMin: number;
  budgetMax: number;
  groupSize: number;
  activities: string[];
  travelStyle: string;
  accommodation: string;
  description: string;
  status: TripStatus;
  itinerary: ItineraryDay[];
  rules: string[];
  photos: string[];
  guideId?: string;
  emergencyInfo?: string;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto?: string;
  type: "single" | "group";
  travelersCount: number;
  memberNames: string[];
  destination: string;
  dates: string;
  budget: string;
  interests: string[];
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

export interface Group {
  id: string;
  tripId: string;
  creatorId: string;
  memberIds: string[];
  pendingInviteIds: string[];
  joinRequestIds: string[];
  recruiting: boolean; // Find More Travelers ON / OFF
  groupJoinRequests?: GroupJoinRequest[];
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  tripId: string;
  rating: number;
  text: string;
  verifiedTrip: boolean;
  isGuideReview?: boolean;
}

export interface Guide {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  password?: string;
  photo: string;
  location: string;
  experienceYears: number;
  languages: string[];
  specialties: string[];
  destinations?: string[];
  pricePerDay: number;
  rating: number;
  verifiedTrips: number;
  availability: string;
  certifications: string[];
  areasCovered: string[];
  photos: string[];
  bio: string;
  answers: CompatibilityAnswers;
  verificationStatus?: "unverified" | "verified";
}

export interface Message {
  id: string;
  senderId: string;
  groupId: string;
  conversationId?: string;
  recipientId?: string;
  message: string;
  timestamp: string;
  type: "text" | "location" | "system" | "itinerary";
  readBy?: string[];
}

export interface GuideRequest {
  id: string;
  groupId?: string;
  tripId?: string;
  guideId: string;
  fromUserId: string;
  travelerName: string;
  travelerPhoto?: string;
  destination: string;
  dates: string;
  budget: string | number;
  interests: string[];
  travelersCount: number;
  compatibilityScore?: number;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

export interface CompatibilityBreakdown {
  overall: number;
  highlights: string[];
  penalties: string[];
  matches: string[];
  differences: string[];
}

export interface PlannerActivity {
  id: string;
  day: number;
  time: string;
  title: string;
  details?: string;
  notes?: string;
  location?: string;
  category?: "sightseeing" | "food" | "transport" | "stay" | "activity";
}

export interface PlannerBooking {
  id: string;
  type: "flight" | "hotel" | "rental car" | "train/bus" | "other";
  provider: string;
  dateTime: string;
  referenceNumber: string;
  notes?: string;
}

export interface PlannerLocation {
  id: string;
  name: string;
  order: number;
  travelTimeFromPrev?: string;
  routeInfo?: string;
}

export interface PlannerExpense {
  id: string;
  title: string;
  category: "Transport" | "Stay" | "Food" | "Activities" | "Other";
  amount: number;
  date?: string;
}

export interface TripPlan {
  id: string;
  tripId?: string;
  userId?: string;
  title: string;
  destination: string;
  dates: string;
  totalBudget: number;
  activities: PlannerActivity[];
  bookings: PlannerBooking[];
  locations: PlannerLocation[];
  expenses: PlannerExpense[];
}

export interface AppState {
  users: User[];
  trips: Trip[];
  groups: Group[];
  reviews: Review[];
  guides: Guide[];
  messages: Message[];
  invitations: Invitation[];
  guideRequests: GuideRequest[];
  groupJoinRequests: GroupJoinRequest[];
  tripPlans: TripPlan[];
  currentUserId: string | null;
  currentGuideId: string | null;
  userRole: "traveler" | "guide" | null;
}

export interface ExploreFilters {
  destination: string;
  startDate: string;
  endDate: string;
  startingLocation: string;
  budgetMin: number;
  budgetMax: number;
  groupSize: number;
  travelStyle: string;
  onlyRecruiting?: boolean;
}
