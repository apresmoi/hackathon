// src/hooks/useUserData.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserMetrics, DailyLog, DailyLogs, StoredDailyLog } from '@/lib/types';
import {
  getUserProfile,
  setUserProfile as setUserProfileInStorage,
  getUserMetrics,
  setUserMetrics as setUserMetricsInStorage,
  getDailyLogs,
  setDailyLogs as setDailyLogsInStorage,
  resetAllUserData as resetAllUserDataInStorage,
} from '@/lib/localStorage';
import { calculateAllMetrics } from '@/lib/fitnessCalculations';
import { format, subDays, parseISO } from 'date-fns';

const getCurrentDateString = () => format(new Date(), 'yyyy-MM-dd');

export function useUserData() {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [userMetrics, setUserMetricsState] = useState<UserMetrics | null>(null);
  const [dailyLogs, setDailyLogsState] = useState<DailyLogs>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    const metrics = getUserMetrics();
    const logs = getDailyLogs();
    
    if (profile) setUserProfileState(profile);
    if (metrics) setUserMetricsState(metrics);
    if (logs) setDailyLogsState(logs);
    
    setIsLoading(false);
  }, []);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      setUserProfileInStorage(profile);
      const metrics = calculateAllMetrics(profile);
      setUserMetricsState(metrics);
      setUserMetricsInStorage(metrics);
    } else {
      resetAllUserDataInStorage();
      setUserMetricsState(null);
      setDailyLogsState({});
    }
  }, []);

  const updateUserProfile = useCallback((updatedProfileData: Partial<UserProfile>) => {
    if (userProfile) {
      const newProfile = { ...userProfile, ...updatedProfileData };
      setUserProfile(newProfile);
    }
  }, [userProfile, setUserProfile]);

  const addDailyLogEntry = useCallback((date: string, entry: Omit<DailyLog, 'date' | 'caloriesConsumed' | 'caloriesBurned' | 'netCalories'>) => {
    setDailyLogsState(prevLogs => {
      const existingLog = prevLogs[date] || { date, meals: [], exercises: [], caloriesConsumed: 0, caloriesBurned: 0, netCalories: 0 };
      
      const updatedMeals = [...existingLog.meals, ...entry.meals];
      const updatedExercises = [...existingLog.exercises, ...entry.exercises];

      const caloriesConsumed = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const caloriesBurned = updatedExercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
      const netCalories = caloriesConsumed - caloriesBurned;

      const newLog: StoredDailyLog = {
        ...existingLog,
        meals: updatedMeals,
        exercises: updatedExercises,
        caloriesConsumed,
        caloriesBurned,
        netCalories,
        notes: entry.notes || existingLog.notes,
      };
      
      const newLogs = { ...prevLogs, [date]: newLog };
      setDailyLogsInStorage(newLogs);
      return newLogs;
    });
  }, []);

  const updateDailyLog = useCallback((date: string, updatedLogData: Partial<StoredDailyLog>) => {
    setDailyLogsState(prevLogs => {
      const existingLog = prevLogs[date];
      if (!existingLog) return prevLogs;

      const updatedLog = { ...existingLog, ...updatedLogData };
      
      // Recalculate totals if meals or exercises changed
      if(updatedLogData.meals || updatedLogData.exercises) {
        updatedLog.caloriesConsumed = updatedLog.meals.reduce((sum, meal) => sum + meal.calories, 0);
        updatedLog.caloriesBurned = updatedLog.exercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
        updatedLog.netCalories = updatedLog.caloriesConsumed - updatedLog.caloriesBurned;
      }
      
      const newLogs = { ...prevLogs, [date]: updatedLog };
      setDailyLogsInStorage(newLogs);
      return newLogs;
    });
  }, []);


  const getLogForDate = useCallback((date: string): StoredDailyLog | undefined => {
    return dailyLogs[date];
  }, [dailyLogs]);

  const getTodaysLog = useCallback((): StoredDailyLog | undefined => {
    return getLogForDate(getCurrentDateString());
  }, [getLogForDate]);
  
  const getRecentLogs = useCallback((days: number = 7): StoredDailyLog[] => {
    const logs: StoredDailyLog[] = [];
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const log = dailyLogs[date];
      if (log) {
        logs.push(log);
      } else {
        // Push a placeholder for days with no logs for chart consistency
        logs.push({
          date,
          meals: [],
          exercises: [],
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
        });
      }
    }
    return logs.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()); // Sort by date ascending
  }, [dailyLogs]);


  const resetAllUserData = useCallback(() => {
    resetAllUserDataInStorage();
    setUserProfileState(null);
    setUserMetricsState(null);
    setDailyLogsState({});
  }, []);

  return {
    userProfile,
    setUserProfile,
    updateUserProfile,
    userMetrics,
    dailyLogs,
    addDailyLogEntry,
    updateDailyLog,
    getLogForDate,
    getTodaysLog,
    getRecentLogs,
    isLoading,
    resetAllUserData,
  };
}
