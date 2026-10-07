import type {
  CompatibilityAnswers,
  CompatibilityBreakdown,
  Trip,
  User,
} from "./types";

function strVal(answers: CompatibilityAnswers | undefined, key: string): string {
  if (!answers) return "";
  const v = answers[key];
  return typeof v === "string" ? v : "";
}

function arrVal(answers: CompatibilityAnswers | undefined, key: string): string[] {
  if (!answers) return [];
  const v = answers[key];
  if (Array.isArray(v)) return v.map(String);
  return [];
}

function scoreQ1Destination(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if ((a === "Mountains" && b === "Nature") || (b === "Mountains" && a === "Nature")) return 0.85;
  if ((a === "Nature" && b === "Deserts") || (b === "Nature" && a === "Deserts")) return 0.75;
  if ((a === "Beaches" && b === "Nature") || (b === "Beaches" && a === "Nature")) return 0.7;
  return 0.55;
}

function scoreQ2IdealTrip(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("mixture") || b.includes("mixture")) return 0.9;
  if ((a === "Adventurous" && b === "Exploring and sightseeing") || (b === "Adventurous" && a === "Exploring and sightseeing")) return 0.85;
  if ((a === "Relaxing" && b === "Exploring and sightseeing") || (b === "Relaxing" && a === "Exploring and sightseeing")) return 0.75;
  if ((a === "Relaxing" && b === "Party and social") || (b === "Relaxing" && a === "Party and social")) return 0.4;
  return 0.6;
}

function scoreQ3Activities(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0.75;
  const common = a.filter((item) => b.includes(item));
  const union = Array.from(new Set([...a, ...b]));
  if (union.length === 0) return 0.75;
  const jaccard = common.length / union.length;
  return Math.min(1.0, 0.4 + jaccard * 0.6);
}

function scoreQ4Budget(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  const tiers = ["Budget", "Moderate", "Comfortable", "Luxury"];
  const idxA = tiers.indexOf(a);
  const idxB = tiers.indexOf(b);
  if (idxA >= 0 && idxB >= 0) {
    const diff = Math.abs(idxA - idxB);
    if (diff === 1) return 0.85;
    if (diff === 2) return 0.55;
    return 0.25; // severe clash
  }
  return 0.7;
}

function scoreQ5Pace(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("Balanced") || b.includes("Balanced")) return 0.85;
  return 0.4;
}

function scoreQ6Social(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  const scale = [
    "Very quiet — I prefer my own space",
    "Mostly quiet",
    "Somewhere in between",
    "Quite social",
    "Very social — I enjoy meeting new people",
  ];
  const idxA = scale.indexOf(a);
  const idxB = scale.indexOf(b);
  if (idxA >= 0 && idxB >= 0) {
    const diff = Math.abs(idxA - idxB);
    if (diff === 1) return 0.85;
    if (diff === 2) return 0.7;
    if (diff === 3) return 0.5;
    return 0.3; // major clash
  }
  return 0.7;
}

function scoreQ7TravelWith(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("Doesn't matter") || b.includes("Doesn't matter")) return 0.95;
  if ((a.includes("One companion") && b.includes("Small group")) || (b.includes("One companion") && a.includes("Small group"))) return 0.8;
  if ((a.includes("Small group") && b.includes("Large group")) || (b.includes("Small group") && a.includes("Large group"))) return 0.75;
  return 0.5;
}

function scoreQ8Accommodation(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if ((a === "Hotel" && b === "Resort") || (b === "Hotel" && a === "Resort")) return 0.85;
  if ((a === "Hostel" && b === "Homestay") || (b === "Hostel" && a === "Homestay")) return 0.85;
  if ((a === "Camping" && b === "Homestay") || (b === "Camping" && a === "Homestay")) return 0.75;
  if ((a === "Hostel" && b === "Resort") || (b === "Hostel" && a === "Resort")) return 0.4;
  if ((a === "Camping" && b === "Resort") || (b === "Camping" && a === "Resort")) return 0.35;
  return 0.6;
}

function scoreQ9Priorities(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0.75;
  let score = 0;
  // Check overlapping top 3
  const overlap = a.filter((item) => b.includes(item));
  if (overlap.length >= 3) score = 1.0;
  else if (overlap.length === 2) score = 0.85;
  else if (overlap.length === 1) score = 0.65;
  else score = 0.45;
  return score;
}

function scoreQ10ActiveTime(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("Depends") || b.includes("Depends")) return 0.9;
  if ((a === "Early morning" && b === "Late night") || (b === "Early morning" && a === "Late night")) return 0.35;
  if ((a === "Early morning" && b === "Afternoon") || (b === "Early morning" && a === "Afternoon")) return 0.8;
  if ((a === "Afternoon" && b === "Evening") || (b === "Afternoon" && a === "Evening")) return 0.85;
  if ((a === "Evening" && b === "Late night") || (b === "Evening" && a === "Late night")) return 0.85;
  return 0.6;
}

function scoreQ11Spontaneous(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  const options = [
    "I love them",
    "Usually okay with them",
    "Depends on the situation",
    "I prefer some planning",
    "I prefer everything planned",
  ];
  const idxA = options.indexOf(a);
  const idxB = options.indexOf(b);
  if (idxA >= 0 && idxB >= 0) {
    const diff = Math.abs(idxA - idxB);
    if (diff === 1) return 0.85;
    if (diff === 2) return 0.7;
    if (diff === 3) return 0.5;
    return 0.3; // clash
  }
  return 0.7;
}

function scoreQ12Transit(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("Doesn't matter") || b.includes("Doesn't matter")) return 0.95;
  return 0.75;
}

function scoreQ13Food(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("open to anything") || b.includes("open to anything")) return 0.95;
  if ((a.includes("Local") && b.includes("Home-style")) || (b.includes("Local") && a.includes("Home-style"))) return 0.85;
  return 0.7;
}

function scoreQ14PersonalSpace(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  const scale = [
    "A lot of alone time",
    "Some alone time every day",
    "A little personal space",
    "I prefer staying with the group",
    "I like doing almost everything together",
  ];
  const idxA = scale.indexOf(a);
  const idxB = scale.indexOf(b);
  if (idxA >= 0 && idxB >= 0) {
    const diff = Math.abs(idxA - idxB);
    if (diff === 1) return 0.85;
    if (diff === 2) return 0.7;
    if (diff === 3) return 0.5;
    return 0.25; // severe clash
  }
  return 0.7;
}

function scoreQ15CompanionStyle(a: string, b: string): number {
  if (!a || !b) return 0.75;
  if (a === b) return 1.0;
  if (a.includes("similar") || b.includes("similar")) return 0.9;
  if ((a === "Adventurous" && b === "Easy-going") || (b === "Adventurous" && a === "Easy-going")) return 0.85;
  if ((a === "Calm and quiet" && b === "Fun and social") || (b === "Calm and quiet" && a === "Fun and social")) return 0.5;
  return 0.75;
}

export function compareAnswers(
  a: CompatibilityAnswers | undefined,
  b: CompatibilityAnswers | undefined
): CompatibilityBreakdown {
  if (!a || !b) {
    return {
      overall: 78,
      highlights: ["General compatibility", "Flexible preferences"],
      penalties: [],
      matches: ["General travel spirit"],
      differences: [],
    };
  }

  const q1 = scoreQ1Destination(strVal(a, "q1_destination"), strVal(b, "q1_destination"));
  const q2 = scoreQ2IdealTrip(strVal(a, "q2_idealTrip"), strVal(b, "q2_idealTrip"));
  const q3 = scoreQ3Activities(arrVal(a, "q3_activities"), arrVal(b, "q3_activities"));
  const q4 = scoreQ4Budget(strVal(a, "q4_budget"), strVal(b, "q4_budget"));
  const q5 = scoreQ5Pace(strVal(a, "q5_pace"), strVal(b, "q5_pace"));
  const q6 = scoreQ6Social(strVal(a, "q6_social"), strVal(b, "q6_social"));
  const q7 = scoreQ7TravelWith(strVal(a, "q7_travelWith"), strVal(b, "q7_travelWith"));
  const q8 = scoreQ8Accommodation(strVal(a, "q8_accommodation"), strVal(b, "q8_accommodation"));
  const q9 = scoreQ9Priorities(arrVal(a, "q9_topPriorities"), arrVal(b, "q9_topPriorities"));
  const q10 = scoreQ10ActiveTime(strVal(a, "q10_activeTime"), strVal(b, "q10_activeTime"));
  const q11 = scoreQ11Spontaneous(strVal(a, "q11_spontaneous"), strVal(b, "q11_spontaneous"));
  const q12 = scoreQ12Transit(strVal(a, "q12_transit"), strVal(b, "q12_transit"));
  const q13 = scoreQ13Food(strVal(a, "q13_food"), strVal(b, "q13_food"));
  const q14 = scoreQ14PersonalSpace(strVal(a, "q14_personalSpace"), strVal(b, "q14_personalSpace"));
  const q15 = scoreQ15CompanionStyle(strVal(a, "q15_companionStyle"), strVal(b, "q15_companionStyle"));

  // Weighted calculation
  // High weights: Q4 (budget), Q5 (pace), Q6 (social), Q8 (accommodation), Q10 (active time), Q11 (spontaneity), Q14 (space) => 7 questions * 7.5 = 52.5
  const highSum = (q4 + q5 + q6 + q8 + q10 + q11 + q14) * 7.5;
  // Medium weights: Q1 (destination), Q2 (ideal trip), Q3 (activities), Q7 (travel with), Q9 (priorities), Q15 (companion) => 6 questions * 6.5 = 39.0
  const medSum = (q1 + q2 + q3 + q7 + q9 + q15) * 6.5;
  // Low weights: Q12 (transit), Q13 (food) => 2 questions * 4.25 = 8.5
  const lowSum = (q12 + q13) * 4.25;

  let raw = highSum + medSum + lowSum;

  const penalties: string[] = [];
  if (q4 <= 0.25) {
    raw -= 15;
    penalties.push("Significant budget tier mismatch (Budget vs Luxury)");
  }
  if (q6 <= 0.3) {
    raw -= 12;
    penalties.push("Social interaction comfort levels differ");
  }
  if (q14 <= 0.25) {
    raw -= 12;
    penalties.push("Personal downtime & alone time preferences differ");
  }
  if (q11 <= 0.3) {
    raw -= 10;
    penalties.push("Spontaneous vs structured itinerary styles clash");
  }

  const overall = Math.max(20, Math.min(99, Math.round(raw)));

  const highlights: string[] = [];
  const matches: string[] = [];
  const differences: string[] = [];

  if (q4 >= 0.85) highlights.push("Aligned budget expectations");
  if (q5 >= 0.85) highlights.push("Compatible travel pace");
  if (q1 >= 0.85) highlights.push("Shared destination preference");
  if (q2 >= 0.85) highlights.push("Aligned trip vision & style");
  if (q9 >= 0.8) highlights.push("Shared top trip priorities");
  if (q10 >= 0.85) highlights.push("Synchronized daily rhythm");
  if (q11 >= 0.85) highlights.push("Similar planning spontaneity");
  if (q14 >= 0.85) highlights.push("Compatible personal space balance");

  if (highlights.length === 0) {
    highlights.push("Flexible travel preferences", "Open-minded journey pace");
  }

  if (q1 >= 0.85) matches.push("Similar favorite destination types");
  if (q3 >= 0.75) matches.push("Common favorite activities");
  if (q4 >= 0.85) matches.push("Matching budget tier");
  if (q6 >= 0.85) matches.push("Similar social vibe while on the road");

  if (q4 < 0.6) differences.push("Different budget expectations");
  if (q5 < 0.6) differences.push("Different travel pacing (relaxed vs fast)");
  if (q10 < 0.6) differences.push("Different active hours (early bird vs late night)");
  if (q14 < 0.6) differences.push("Personal downtime expectations differ");

  return {
    overall,
    highlights: highlights.slice(0, 4),
    penalties,
    matches: matches.slice(0, 4),
    differences: differences.slice(0, 3),
  };
}

export function compareUsers(me: User, other: User): CompatibilityBreakdown | null {
  if (!me.compatibilityAnswers || !other.compatibilityAnswers) return null;
  return compareAnswers(me.compatibilityAnswers, other.compatibilityAnswers);
}

export function compareUserToTrip(me: User, trip: Trip, creator?: User): CompatibilityBreakdown | null {
  if (!me.compatibilityAnswers) return null;
  const base = creator?.compatibilityAnswers
    ? compareAnswers(me.compatibilityAnswers, creator.compatibilityAnswers)
    : compareAnswers(me.compatibilityAnswers, me.compatibilityAnswers);

  let boost = 0;
  if (trip.travelStyle && me.compatibilityAnswers.q2_idealTrip?.toLowerCase().includes(trip.travelStyle.toLowerCase())) {
    boost += 3;
  }
  if (trip.activities && me.compatibilityAnswers.q3_activities) {
    const act = me.compatibilityAnswers.q3_activities;
    const common = trip.activities.filter((x) =>
      act.some((a) => a.toLowerCase().includes(x.toLowerCase()) || x.toLowerCase().includes(a.toLowerCase()))
    ).length;
    if (common > 0) boost += Math.min(6, common * 2);
  }

  return {
    ...base,
    overall: Math.min(99, base.overall + boost),
  };
}

export function tripMatchesFilters(
  trip: Trip,
  filters: {
    destination?: string;
    startDate?: string;
    endDate?: string;
    startingLocation?: string;
    budgetMin?: number;
    budgetMax?: number;
    groupSize?: number;
    travelStyle?: string;
  }
) {
  if (filters.destination && !trip.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
    return false;
  }
  if (filters.startingLocation && !trip.startingLocation.toLowerCase().includes(filters.startingLocation.toLowerCase())) {
    return false;
  }
  if (filters.travelStyle && filters.travelStyle !== "any" && trip.travelStyle.toLowerCase() !== filters.travelStyle.toLowerCase()) {
    return false;
  }
  if (filters.budgetMin && trip.budgetMax < filters.budgetMin) return false;
  if (filters.budgetMax && trip.budgetMin > filters.budgetMax) return false;
  if (filters.groupSize && trip.groupSize < filters.groupSize) return false;
  if (filters.startDate && trip.endDate < filters.startDate) return false;
  if (filters.endDate && trip.startDate > filters.endDate) return false;
  return true;
}
