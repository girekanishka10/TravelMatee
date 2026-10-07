import type { CompatibilityAnswers, TravelPersonality } from "./types";

export function buildPersonality(answers: CompatibilityAnswers): TravelPersonality {
  const idealTrip = answers.q2_idealTrip || "";
  const activities = answers.q3_activities || [];
  const budget = answers.q4_budget || "";
  const pace = answers.q5_pace || "";
  const socialLevel = answers.q6_social || "";
  const accommodation = answers.q8_accommodation || "";
  const priorities = answers.q9_topPriorities || [];
  const spontaneous = answers.q11_spontaneous || "";
  const personalSpace = answers.q14_personalSpace || "";
  const companionStyle = answers.q15_companionStyle || "";

  let adventure = 50;
  if (idealTrip === "Adventurous") adventure += 25;
  if (activities.includes("Trekking") || activities.includes("Camping") || activities.includes("Water sports")) adventure += 20;
  if (priorities.includes("Adventure")) adventure += 15;
  if (idealTrip === "Relaxing") adventure -= 15;

  let social = 50;
  if (socialLevel.includes("Very social")) social += 35;
  else if (socialLevel.includes("Quite social")) social += 20;
  else if (socialLevel.includes("Very quiet")) social -= 25;
  if (personalSpace.includes("doing almost everything together")) social += 15;
  else if (personalSpace.includes("A lot of alone time")) social -= 20;

  let planning = 50;
  if (spontaneous.includes("everything planned")) planning += 35;
  else if (spontaneous.includes("some planning")) planning += 15;
  else if (spontaneous.includes("love them")) planning -= 25;
  if (companionStyle === "Organised") planning += 15;
  if (priorities.includes("Safety")) planning += 10;

  let comfort = 50;
  if (budget === "Luxury") comfort += 35;
  else if (budget === "Comfortable") comfort += 20;
  else if (budget === "Budget") comfort -= 20;
  if (accommodation === "Resort" || accommodation === "Hotel") comfort += 15;
  if (accommodation === "Camping" || accommodation === "Hostel") comfort -= 15;
  if (priorities.includes("Comfort")) comfort += 15;

  let spontaneity = 50;
  if (spontaneous.includes("love them")) spontaneity += 35;
  else if (spontaneous.includes("Usually okay")) spontaneity += 15;
  else if (spontaneous.includes("everything planned")) spontaneity -= 30;
  if (pace.includes("Fast")) spontaneity += 10;

  adventure = clamp(adventure);
  social = clamp(social);
  planning = clamp(planning);
  comfort = clamp(comfort);
  spontaneity = clamp(spontaneity);

  let title = "Balanced Explorer";
  const emoji = "";

  if (adventure >= 70) {
    title = "Adventure Trailblazer";
  } else if (comfort >= 70) {
    title = "Comfort Seeker";
  } else if (planning >= 70) {
    title = "Structured Planner";
  } else if (spontaneity >= 70) {
    title = "Spontaneous Roamer";
  } else if (social >= 70) {
    title = "Social Nomad";
  } else if (social <= 35) {
    title = "Quiet Wanderer";
  }

  return {
    title,
    emoji,
    scores: { adventure, social, planning, comfort, spontaneity },
  };
}

function clamp(n: number) {
  return Math.max(15, Math.min(95, n));
}
