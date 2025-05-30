// src/components/dashboard/WeeklyAdjustment.tsx
"use client";

import { useEffect, useState } from "react";
import type { StoredDailyLog, UserMetrics, UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, TrendingDown, Shuffle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyAdjustmentProps {
  recentLogs: StoredDailyLog[]; // Should be last 7 days of logs
  userMetrics: UserMetrics | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

export function WeeklyAdjustment({ recentLogs, userMetrics, userProfile, isLoading }: WeeklyAdjustmentProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !userMetrics || !userProfile || recentLogs.length < 3) { // Require at least 3 days of logs for a suggestion
      setSuggestion(null);
      return;
    }

    const loggedDays = recentLogs.filter(log => log.meals.length > 0 || log.exercises.length > 0);
    if (loggedDays.length < 3) {
        setSuggestion("Log at least 3 days this week to get personalized suggestions.");
        return;
    }

    const totalNetCalories = loggedDays.reduce((sum, log) => sum + log.netCalories, 0);
    const averageNetCalories = totalNetCalories / loggedDays.length;
    const calorieDifference = averageNetCalories - userMetrics.goalCalories;
    
    let newSuggestion = "";

    if (userProfile.goal === "fat_loss") {
      if (calorieDifference > 50) { // Consistently above target for fat loss
        newSuggestion = `Your average daily net calories (${averageNetCalories.toFixed(0)}) are above your target (${userMetrics.goalCalories}). Consider reducing portion sizes or increasing exercise intensity/duration.`;
      } else if (calorieDifference < -200) { // Significantly below, might be too aggressive
        newSuggestion = `You're well below your calorie target (${averageNetCalories.toFixed(0)} vs ${userMetrics.goalCalories}). Ensure you're getting enough nutrients. If you feel good, continue, otherwise consider a slight increase.`;
      } else {
        newSuggestion = `You're on track with your fat loss goal (${averageNetCalories.toFixed(0)} net kcal average). Keep up the great work!`;
      }
    } else if (userProfile.goal === "muscle_gain") {
      if (calorieDifference < -50) { // Consistently below target for muscle gain
        newSuggestion = `Your average daily net calories (${averageNetCalories.toFixed(0)}) are below your target (${userMetrics.goalCalories}). Try adding more calorie-dense, protein-rich foods to your meals.`;
      } else if (calorieDifference > 300) { // Significantly above, might lead to excess fat
        newSuggestion = `You're significantly above your calorie target (${averageNetCalories.toFixed(0)} vs ${userMetrics.goalCalories}). Ensure your surplus is mainly from lean protein and complex carbs.`;
      } else {
        newSuggestion = `You're doing well with your muscle gain calorie target (${averageNetCalories.toFixed(0)} net kcal average). Focus on progressive overload in your workouts!`;
      }
    } else { // Maintenance
      if (Math.abs(calorieDifference) > 150) { // Deviating too much from maintenance
        newSuggestion = `Your average net calories (${averageNetCalories.toFixed(0)}) are deviating from your maintenance target (${userMetrics.goalCalories}). Adjust your intake or activity slightly to stay balanced.`;
      } else {
        newSuggestion = `You're maintaining your calorie balance well (${averageNetCalories.toFixed(0)} net kcal average). Consistency is key!`;
      }
    }
    setSuggestion(newSuggestion);

  }, [recentLogs, userMetrics, userProfile, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  let Icon = Lightbulb;
  if (suggestion?.includes("above your target") || suggestion?.includes("deviating")) Icon = TrendingDown;
  if (suggestion?.includes("below your target") || suggestion?.includes("increase")) Icon = TrendingUp;
  if (suggestion?.includes("on track") || suggestion?.includes("doing well") || suggestion?.includes("maintaining")) Icon = Lightbulb;


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Icon className="mr-2 h-5 w-5 text-primary"/>Weekly Insights & Suggestions</CardTitle>
        <CardDescription>Based on your logs from the past week.</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestion ? (
          <p className="text-sm">{suggestion}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Keep logging your activities to receive weekly suggestions. Aim for at least 3 logged days a week.</p>
        )}
      </CardContent>
    </Card>
  );
}
