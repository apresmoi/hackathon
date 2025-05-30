import type { UserProfile, Goal } from './types';
import { ACTIVITY_LEVELS } from './constants';

export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function calculateBMR(profile: Pick<UserProfile, 'age' | 'gender' | 'height' | 'weight'>): number {
  const { age, gender, height, weight } = profile;
  if (age <= 0 || height <= 0 || weight <= 0) return 0;

  let bmr: number;
  if (gender === 'male') {
    // Harris-Benedict for men: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age in years)
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    // Harris-Benedict for women: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age in years)
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  return parseFloat(bmr.toFixed(0));
}

export function calculateTDEE(bmr: number, activityLevelKey: UserProfile['activityLevel']): number {
  if (bmr <= 0) return 0;
  const activityMultiplier = parseFloat(ACTIVITY_LEVELS[activityLevelKey].value);
  return parseFloat((bmr * activityMultiplier).toFixed(0));
}

export function calculateGoalCalories(tdee: number, goal: Goal): number {
  if (tdee <= 0) return 0;
  let adjustmentFactor = 0; // For maintenance

  if (goal === 'fat_loss') {
    adjustmentFactor = -0.15; // 15% deficit
  } else if (goal === 'muscle_gain') {
    adjustmentFactor = 0.15; // 15% surplus
  }

  return parseFloat((tdee * (1 + adjustmentFactor)).toFixed(0));
}

export function calculateAllMetrics(profile: UserProfile) {
  const bmi = calculateBMI(profile.height, profile.weight);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const goalCalories = calculateGoalCalories(tdee, profile.goal);
  return { bmi, bmr, tdee, goalCalories };
}
