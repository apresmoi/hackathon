import type { Reminder } from '@/types/reminder';
import { format } from 'date-fns';

// In-memory store for reminders and user data (for mocking purposes)
export let reminders: Reminder[] = [
  { id: '1', title: 'Drink Water', description: 'Every 2 hours', time: '10:00', frequency: 'Daily', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), completed: true, xpValue: 10, icon: 'Droplet' },
  { id: '2', title: '5-min Stretch', description: 'At 3 PM', time: '15:00', frequency: 'Once', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completed: false, xpValue: 15, icon: 'StretchHorizontal' },
  { id: '3', title: 'Team Meeting', description: 'Weekly sync', time: '11:00', frequency: 'Weekly', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), nextNotificationAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), completed: false, xpValue: 20, icon: 'Users' },
  { id: '4', title: 'Read a chapter', description: 'Before bed', time: '22:00', frequency: 'Daily', createdAt: new Date().toISOString(), completed: false, xpValue: 10, icon: 'BookOpen' },
];

export interface UserData {
  xp: number;
  currentStreak: number;
  lastCompletionDate: string | null; // Store date as 'yyyy-MM-dd'
}

export let userData: UserData = {
  xp: 125, // Starting XP
  currentStreak: 0,
  lastCompletionDate: null,
};

export const XP_LEVELS = [
  { level: 1, minXP: 0, label: "Beginner" },
  { level: 2, minXP: 100, label: "Novice" },
  { level: 3, minXP: 250, label: "Apprentice" },
  { level: 4, minXP: 500, label: "Adept" },
  { level: 5, minXP: 800, label: "Expert" },
  { level: 6, minXP: 1200, label: "Master" },
  { level: 7, minXP: 1700, label: "Grandmaster" },
  { level: 8, minXP: 2300, label: "Legend" },
  { level: 9, minXP: 3000, label: "Virtuoso" },
  { level: 10, minXP: 4000, label: "Champion" },
  // Add more levels as needed
];


export function calculateLevelInfo(currentXP: number) {
  let currentLevel = 1;
  let currentLevelLabel = XP_LEVELS[0].label;
  let xpForCurrentLevelStart = 0;
  let xpForNextLevel = XP_LEVELS[1]?.minXP || currentXP + 100; // Default if no next level defined

  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (currentXP >= XP_LEVELS[i].minXP) {
      currentLevel = XP_LEVELS[i].level;
      currentLevelLabel = XP_LEVELS[i].label;
      xpForCurrentLevelStart = XP_LEVELS[i].minXP;
      if (i + 1 < XP_LEVELS.length) {
        xpForNextLevel = XP_LEVELS[i + 1].minXP;
      } else {
        // Max level reached or beyond defined levels
        xpForNextLevel = currentXP; // At max level, progress bar is full or not shown
      }
      break;
    }
  }
  
  // If currentXP equals xpForNextLevel and it's not the absolute max level, it means user just leveled up.
  // So, the progress should be 0 towards the *new* next level.
  // However, our loop structure finds the *current* level.
  // If currentXP is, say, 250, and level 3 starts at 250, level 4 starts at 500.
  // Progress is (250 - 250) / (500 - 250) = 0. This is correct.

  let progressPercentage = 0;
  if (xpForNextLevel > xpForCurrentLevelStart && currentXP < xpForNextLevel) {
     progressPercentage = ((currentXP - xpForCurrentLevelStart) / (xpForNextLevel - xpForCurrentLevelStart)) * 100;
  } else if (currentXP >= xpForNextLevel && currentLevel < XP_LEVELS[XP_LEVELS.length - 1].level) {
    // This case should ideally not be hit if xpForNextLevel is correctly the start of the next level.
    // It implies the user is at the threshold of the next level but hasn't "crossed" into it for calculation yet.
    // Or, they are at max level.
    progressPercentage = 100; 
  } else if (currentXP >= xpForNextLevel && currentLevel === XP_LEVELS[XP_LEVELS.length - 1].level) {
    // User is at max level and XP might exceed what's needed for it.
    progressPercentage = 100;
  }


  return {
    currentLevel,
    currentLevelLabel,
    currentXP,
    xpForCurrentLevelStart,
    xpForNextLevel: currentLevel === XP_LEVELS[XP_LEVELS.length - 1].level && currentXP >= xpForNextLevel ? currentXP : xpForNextLevel, // If max level, next is current
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
}


export const SNOOZE_PENALTY = 5;
export const DEFAULT_XP_VALUE = 10;
export const DEFAULT_REMINDER_ICON = 'ClipboardList';

export const QUICK_COMPLETION_WINDOW_MINUTES = 5;
export const QUICK_COMPLETION_BONUS_XP = 5;
export const STREAK_BONUS_XP_PER_CONSECUTIVE_DAY = 1; // For each day in streak beyond the first

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return format(yesterday, 'yyyy-MM-dd');
}


// Note: This in-memory store will reset on server restarts and won't work correctly in a multi-instance serverless environment.
// For a real application, use a persistent database.
