import type { ActivityLevelDetail, ActivityLevelKey, Goal } from './types';

export const APP_NAME = "MacroMapper";

export const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: 'macroMapper_userProfile_v1',
  USER_METRICS: 'macroMapper_userMetrics_v1',
  DAILY_LOGS: 'macroMapper_dailyLogs_v1',
};

export const ACTIVITY_LEVELS: Record<ActivityLevelKey, ActivityLevelDetail> = {
  sedentary: { label: "Sedentary", value: "1.2", description: "Little to no daily exercise" },
  lightlyActive: { label: "Lightly active", value: "1.375", description: "1–3 days of light exercise per week" },
  moderatelyActive: { label: "Moderately active", value: "1.55", description: "3–5 days of moderate exercise per week" },
  veryActive: { label: "Very active", value: "1.725", description: "5–6 days of intense exercise per week" }
};

export const GOALS: {label: string, value: Goal}[] = [
  { label: "Fat Loss", value: "fat_loss" },
  { label: "Muscle Gain", value: "muscle_gain" },
  { label: "Maintenance", value: "maintenance" },
];

export const GENDERS: {label: string, value: UserProfile['gender']}[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const DIETARY_RESTRICTION_SUGGESTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Low Carb"
];

export const PREFERENCE_SUGGESTIONS = [
  "High Protein", "Quick Meals", "Strength Training", "Cardio", "Yoga", "Home Workouts"
];
