import type { UserProfile, UserMetrics, DailyLogs } from './types';
import { LOCAL_STORAGE_KEYS } from './constants';

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage`, error);
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage`, error);
  }
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage`, error);
  }
}

// User Profile
export const getUserProfile = (): UserProfile | null => getItem<UserProfile>(LOCAL_STORAGE_KEYS.USER_PROFILE);
export const setUserProfile = (profile: UserProfile): void => setItem<UserProfile>(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
export const removeUserProfile = (): void => removeItem(LOCAL_STORAGE_KEYS.USER_PROFILE);

// User Metrics
export const getUserMetrics = (): UserMetrics | null => getItem<UserMetrics>(LOCAL_STORAGE_KEYS.USER_METRICS);
export const setUserMetrics = (metrics: UserMetrics): void => setItem<UserMetrics>(LOCAL_STORAGE_KEYS.USER_METRICS, metrics);
export const removeUserMetrics = (): void => removeItem(LOCAL_STORAGE_KEYS.USER_METRICS);

// Daily Logs
export const getDailyLogs = (): DailyLogs | null => getItem<DailyLogs>(LOCAL_STORAGE_KEYS.DAILY_LOGS);
export const setDailyLogs = (logs: DailyLogs): void => setItem<DailyLogs>(LOCAL_STORAGE_KEYS.DAILY_LOGS, logs);
export const removeDailyLogs = (): void => removeItem(LOCAL_STORAGE_KEYS.DAILY_LOGS);

// Reset All Data
export const resetAllUserData = (): void => {
  removeUserProfile();
  removeUserMetrics();
  removeDailyLogs();
};
