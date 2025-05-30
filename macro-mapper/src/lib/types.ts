export type Gender = 'male' | 'female';
export type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance';
export type ActivityLevelKey = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive';

export interface ActivityLevelDetail {
  label: string;
  value: string; // This is a multiplier, will be parsed to number
  description: string;
}

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  goal: Goal;
  activityLevel: ActivityLevelKey;
  dietaryRestrictions: string[];
  preferences: string[];
}

export interface UserMetrics {
  bmi: number;
  bmr: number;
  tdee: number;
  goalCalories: number;
}

export interface MealLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface ExerciseLog {
  id: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLog[];
  exercises: ExerciseLog[];
  notes?: string; // Optional field for daily notes
}

// Combined structure for what's stored in localStorage for daily logs
export interface StoredDailyLog extends DailyLog {
  caloriesConsumed: number;
  caloriesBurned: number;
  netCalories: number;
}

export type DailyLogs = Record<string, StoredDailyLog>; // Keyed by date string YYYY-MM-DD

// Schema for personalized recommendations from AI
export interface PersonalizedRecommendation {
  mealRecommendations: string[];
  exerciseRecommendations: string[];
}

// For daily summary
export type AchievementStatus = 'achieved' | 'nearly_achieved' | 'needs_improvement';

export interface DailySummary {
  summaryText: string;
  achievementStatus: AchievementStatus;
}
