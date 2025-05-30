
// src/components/dashboard/DailyLogSummary.tsx
"use client";

import type { StoredDailyLog, UserMetrics, MealLog, ExerciseLog, UserProfile, AchievementStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Dumbbell, Activity, ListChecks, StickyNote, Trash2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DailyLogSummaryProps {
  log: StoredDailyLog | undefined;
  userMetrics: UserMetrics | null;
  userProfile: UserProfile | null; // Added
  isLoading: boolean;
  onUpdateLog: (date: string, updatedLogData: Partial<StoredDailyLog>) => void;
  onOpenSummaryDialog: () => void;
  isSummaryActionDisabled: boolean;
}

const SummaryItem: React.FC<{ icon: React.ElementType; label: string; value: string | number; unit?: string; className?: string }> = ({ icon: Icon, label, value, unit, className }) => (
  <div className={`flex items-center space-x-2 p-2 rounded ${className}`}>
    <Icon className="h-5 w-5 text-primary" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-lg">
        {value} <span className="text-xs">{unit}</span>
      </p>
    </div>
  </div>
);

// Function to calculate achievement status locally
const calculateAchievementStatus = (
  netCalories: number,
  goalCalories: number,
  userGoal: UserProfile['goal']
): AchievementStatus => {
  if (userGoal === 'fat_loss') {
    if (netCalories <= goalCalories) return 'achieved';
    if (netCalories <= goalCalories + 150) return 'nearly_achieved';
    return 'needs_improvement';
  }
  if (userGoal === 'muscle_gain') {
    if (netCalories >= goalCalories) return 'achieved';
    if (netCalories >= goalCalories - 150) return 'nearly_achieved';
    return 'needs_improvement';
  }
  // Maintenance
  if (Math.abs(netCalories - goalCalories) <= 100) return 'achieved';
  if (Math.abs(netCalories - goalCalories) <= 250) return 'nearly_achieved';
  return 'needs_improvement';
};


export function DailyLogSummary({ log, userMetrics, userProfile, isLoading, onUpdateLog, onOpenSummaryDialog, isSummaryActionDisabled }: DailyLogSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userMetrics) { 
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
          <CardDescription>Profile data missing or still loading.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No metrics available to display summary.</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentLog = log || { date: 'N/A', meals: [], exercises: [], caloriesConsumed: 0, caloriesBurned: 0, netCalories: 0 };
  const { caloriesConsumed, caloriesBurned, netCalories, meals, exercises, notes } = currentLog;
  const { goalCalories } = userMetrics;
  const progressPercentage = goalCalories > 0 ? Math.min(Math.max((netCalories / goalCalories) * 100, 0), 100) : 0;
  // For fat loss, progress is towards 0 or negative net calories if goal is positive
  // For simplicity, let's use caloriesConsumed / goalCalories for the primary progress bar,
  // as netCalories can be negative and progress component expects positive values.
  const consumptionProgress = goalCalories > 0 ? Math.min(Math.max((caloriesConsumed / goalCalories) * 100, 0), 100) : 0;


  const removeItem = (type: 'meal' | 'exercise', id: string) => {
    if (!log) return; 
    let updatedMeals = log.meals;
    let updatedExercises = log.exercises;

    if (type === 'meal') {
      updatedMeals = log.meals.filter(m => m.id !== id);
    } else {
      updatedExercises = log.exercises.filter(e => e.id !== id);
    }
    onUpdateLog(log.date, { meals: updatedMeals, exercises: updatedExercises });
  };

  let pulseIconColorClass = "text-primary"; // Default color
  if (log && userMetrics && userProfile && !isSummaryActionDisabled) {
    const status = calculateAchievementStatus(log.netCalories, userMetrics.goalCalories, userProfile.goal);
    if (status === 'achieved') pulseIconColorClass = "text-green-500";
    else if (status === 'nearly_achieved') pulseIconColorClass = "text-yellow-500";
    else if (status === 'needs_improvement') pulseIconColorClass = "text-red-500";
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Today's Summary</CardTitle>
          <Button variant="outline" size="sm" onClick={onOpenSummaryDialog} disabled={isSummaryActionDisabled}>
            <Sparkles className={`mr-2 h-4 w-4 ${pulseIconColorClass}`} />
            Get Daily Pulse
          </Button>
        </div>
        <CardDescription>Your progress towards {goalCalories} kcal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Net Calories: <span className="font-bold">{netCalories}</span> kcal</span>
            <span>Goal: <span className="font-bold">{goalCalories}</span> kcal</span>
          </div>
          <Progress value={consumptionProgress} aria-label={`${consumptionProgress.toFixed(0)}% of calorie goal consumed`} className="h-3"/>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {caloriesConsumed} kcal consumed / {goalCalories} kcal goal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <SummaryItem icon={Utensils} label="Consumed" value={caloriesConsumed} unit="kcal" className="bg-green-100 dark:bg-green-900/30" />
          <SummaryItem icon={Dumbbell} label="Burned" value={caloriesBurned} unit="kcal" className="bg-orange-100 dark:bg-orange-900/30" />
          <SummaryItem icon={Activity} label="Net" value={netCalories} unit="kcal" className="bg-blue-100 dark:bg-blue-900/30" />
        </div>

        {(meals.length > 0 || exercises.length > 0) && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" />Logged Items:</h4>
            <ScrollArea className="h-48 border rounded-md p-2 bg-muted/20">
              {meals.map((meal) => (
                <div key={meal.id} className="text-sm p-1.5 border-b border-dashed flex justify-between items-center">
                  <span><Utensils className="h-3 w-3 inline mr-1 text-green-500"/>{meal.name}: {meal.calories} kcal</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete Meal?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{meal.name}"?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeItem('meal', meal.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              {exercises.map((exercise) => (
                <div key={exercise.id} className="text-sm p-1.5 border-b border-dashed flex justify-between items-center">
                  <span><Dumbbell className="h-3 w-3 inline mr-1 text-orange-500"/>{exercise.name}: {exercise.caloriesBurned} kcal ({exercise.duration} min)</span>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete Exercise?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{exercise.name}"?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeItem('exercise', exercise.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
               {meals.length === 0 && exercises.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No meals or exercises logged yet for today.</p>
              )}
            </ScrollArea>
          </div>
        )}
        
        {notes && (
          <div>
            <h4 className="font-semibold mb-1 mt-3 flex items-center"><StickyNote className="mr-2 h-5 w-5 text-primary" />Today's Notes:</h4>
            <p className="text-sm p-2 bg-muted/30 rounded-md whitespace-pre-wrap">{notes}</p>
          </div>
        )}
         {!notes && meals.length === 0 && exercises.length === 0 && (
             <p className="text-sm text-muted-foreground text-center py-4">Log meals, exercises, or notes to see them here.</p>
         )}


      </CardContent>
    </Card>
  );
}

