export interface QuizQuestion {
  id: string;
  number: number;
  question: string;
  options: string[];
  type?: "single" | "multiple" | "rank";
  maxSelect?: number;
  subtitle?: string;
}

export const ACTIVITY_OPTIONS = [
  { id: "trekking", label: "Trekking" },
  { id: "camping", label: "Camping" },
  { id: "photography", label: "Photography" },
  { id: "shopping", label: "Shopping" },
  { id: "sightseeing", label: "Sightseeing" },
  { id: "water", label: "Water sports" },
  { id: "nightlife", label: "Nightlife" },
  { id: "food", label: "Food exploration" },
  { id: "cultural", label: "Cultural experiences" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1_destination",
    number: 1,
    question: "What kind of destination do you prefer?",
    type: "single",
    options: [
      "Mountains",
      "Beaches",
      "Cities",
      "Nature",
      "Deserts",
    ],
  },
  {
    id: "q2_idealTrip",
    number: 2,
    question: "What does your ideal trip look like?",
    type: "single",
    options: [
      "Relaxing",
      "Adventurous",
      "Exploring and sightseeing",
      "Party and social",
      "A mixture of everything",
    ],
  },
  {
    id: "q3_activities",
    number: 3,
    question: "What activities do you enjoy most?",
    type: "multiple",
    subtitle: "Select all that apply",
    options: [
      "Trekking",
      "Camping",
      "Photography",
      "Shopping",
      "Sightseeing",
      "Water sports",
      "Nightlife",
      "Food exploration",
      "Cultural experiences",
    ],
  },
  {
    id: "q4_budget",
    number: 4,
    question: "What type of travel budget do you prefer?",
    type: "single",
    options: [
      "Budget",
      "Moderate",
      "Comfortable",
      "Luxury",
    ],
  },
  {
    id: "q5_pace",
    number: 5,
    question: "What is your preferred travel pace?",
    type: "single",
    options: [
      "Slow and relaxed",
      "Balanced",
      "Fast — explore as much as possible",
    ],
  },
  {
    id: "q6_social",
    number: 6,
    question: "How social are you while travelling?",
    type: "single",
    options: [
      "Very quiet — I prefer my own space",
      "Mostly quiet",
      "Somewhere in between",
      "Quite social",
      "Very social — I enjoy meeting new people",
    ],
  },
  {
    id: "q7_travelWith",
    number: 7,
    question: "Who would you prefer to travel with?",
    type: "single",
    options: [
      "One companion",
      "Small group",
      "Large group",
      "Doesn't matter",
    ],
  },
  {
    id: "q8_accommodation",
    number: 8,
    question: "What type of accommodation do you prefer?",
    type: "single",
    options: [
      "Hostel",
      "Hotel",
      "Resort",
      "Homestay",
      "Camping",
    ],
  },
  {
    id: "q9_topPriorities",
    number: 9,
    question: "What matters most to you during a trip?",
    type: "rank",
    maxSelect: 3,
    subtitle: "Select and rank your top 3",
    options: [
      "Budget",
      "Comfort",
      "Adventure",
      "Safety",
      "Food",
      "Nature",
      "Experiences",
      "Photography",
    ],
  },
  {
    id: "q10_activeTime",
    number: 10,
    question: "When are you most active while travelling?",
    type: "single",
    options: [
      "Early morning",
      "Afternoon",
      "Evening",
      "Late night",
      "Depends on the day",
    ],
  },
  {
    id: "q11_spontaneous",
    number: 11,
    question: "How do you feel about spontaneous plans?",
    type: "single",
    options: [
      "I love them",
      "Usually okay with them",
      "Depends on the situation",
      "I prefer some planning",
      "I prefer everything planned",
    ],
  },
  {
    id: "q12_transit",
    number: 12,
    question: "How do you prefer to travel between places?",
    type: "single",
    options: [
      "Public transport",
      "Cab or car",
      "Bike or scooter",
      "Walking",
      "Doesn't matter",
    ],
  },
  {
    id: "q13_food",
    number: 13,
    question: "What kind of food experience do you prefer?",
    type: "single",
    options: [
      "Local and street food",
      "Restaurants",
      "Healthy/simple food",
      "Home-style food",
      "I'm open to anything",
    ],
  },
  {
    id: "q14_personalSpace",
    number: 14,
    question: "How much personal space do you need during a trip?",
    type: "single",
    options: [
      "A lot of alone time",
      "Some alone time every day",
      "A little personal space",
      "I prefer staying with the group",
      "I like doing almost everything together",
    ],
  },
  {
    id: "q15_companionStyle",
    number: 15,
    question: "What type of travel companion suits you best?",
    type: "single",
    options: [
      "Adventurous",
      "Easy-going",
      "Organised",
      "Fun and social",
      "Calm and quiet",
      "Someone similar to me",
    ],
  },
];
