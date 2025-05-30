
// src/components/dashboard/PersonalizedRecommendations.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendations";
import { estimateMealNutrition } from "@/ai/flows/estimate-meal-nutrition-flow";
import { estimateExerciseCalories } from "@/ai/flows/estimate-exercise-calories-flow";
import type { UserProfile, PersonalizedRecommendation, UserMetrics, MealLog, ExerciseLog, DailyLog } from "@/lib/types";
import { Loader2, Sparkles, Utensils, Dumbbell, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface PersonalizedRecommendationsProps {
  userProfile: UserProfile | null;
  userMetrics: UserMetrics | null;
  addDailyLogEntry: (date: string, entry: Omit<DailyLog, 'date' | 'caloriesConsumed' | 'caloriesBurned' | 'netCalories'>) => void;
  currentDate: string | null;
}

export function PersonalizedRecommendations({ userProfile, userMetrics, addDailyLogEntry, currentDate }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [exerciseDurations, setExerciseDurations] = useState<Record<number, string>>({});
  const [mealLoadingStates, setMealLoadingStates] = useState<Record<number, boolean>>({});
  const [exerciseLoadingStates, setExerciseLoadingStates] = useState<Record<number, boolean>>({});

  const handleFetchRecommendations = async () => {
    if (!userProfile || !userMetrics) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile to get recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations
    setExerciseDurations({}); // Clear previous durations

    try {
      const input = {
        age: userProfile.age,
        gender: userProfile.gender,
        height: userProfile.height,
        weight: userProfile.weight,
        goal: userProfile.goal,
        activityLevel: userProfile.activityLevel,
        dietaryRestrictions: userProfile.dietaryRestrictions,
        preferences: userProfile.preferences,
        dailyCaloriesIntake: userMetrics.goalCalories,
      };
      
      const result = await getPersonalizedRecommendations(input);
      setRecommendations(result);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError("Could not fetch recommendations at this time. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to get recommendations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogMeal = async (mealName: string, index: number) => {
    if (!currentDate) {
      toast({ title: "Error", description: "Cannot log meal, date not available.", variant: "destructive" });
      return;
    }
    setMealLoadingStates(prev => ({ ...prev, [index]: true }));
    try {
      const nutrition = await estimateMealNutrition({ mealName });
      const newMeal: MealLog = {
        id: uuidv4(),
        name: mealName,
        ...nutrition,
      };
      addDailyLogEntry(currentDate, { meals: [newMeal], exercises: [] });
      toast({ title: "Meal Logged", description: `${mealName} added to your daily log.` });
    } catch (err) {
      console.error("Failed to log meal:", err);
      toast({ title: "Logging Error", description: `Could not log ${mealName}. AI suggestion failed.`, variant: "destructive" });
    } finally {
      setMealLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleLogExercise = async (exerciseName: string, index: number) => {
    if (!currentDate) {
      toast({ title: "Error", description: "Cannot log exercise, date not available.", variant: "destructive" });
      return;
    }
    const durationStr = exerciseDurations[index];
    const duration = parseInt(durationStr, 10);

    if (isNaN(duration) || duration <= 0) {
      toast({ title: "Invalid Duration", description: "Please enter a valid duration for the exercise.", variant: "destructive" });
      return;
    }

    setExerciseLoadingStates(prev => ({ ...prev, [index]: true }));
    try {
      const exerciseData = await estimateExerciseCalories({ exerciseName, duration });
      const newExercise: ExerciseLog = {
        id: uuidv4(),
        name: exerciseName,
        duration: duration,
        caloriesBurned: exerciseData.caloriesBurned,
      };
      addDailyLogEntry(currentDate, { meals: [], exercises: [newExercise] });
      toast({ title: "Exercise Logged", description: `${exerciseName} added to your daily log.` });
    } catch (err)
    {
      console.error("Failed to log exercise:", err);
      toast({ title: "Logging Error", description: `Could not log ${exerciseName}. AI suggestion failed.`, variant: "destructive" });
    } finally {
      setExerciseLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" />Personalized Recommendations</CardTitle>
        <CardDescription>Get AI-powered meal and exercise suggestions tailored to you.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Generating recommendations...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {recommendations && !isLoading && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><Utensils className="mr-2 h-4 w-4 text-green-500"/>Meal Ideas:</h3>
              <ul className="space-y-3 text-sm">
                {recommendations.mealRecommendations.map((meal, index) => (
                  <li key={`meal-${index}`} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/20">
                    <span>{meal}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLogMeal(meal, index)}
                      disabled={mealLoadingStates[index] || !currentDate}
                    >
                      {mealLoadingStates[index] ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="mr-1 h-4 w-4" />}
                      Log
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><Dumbbell className="mr-2 h-4 w-4 text-orange-500"/>Exercise Suggestions:</h3>
              <ul className="space-y-3 text-sm">
                {recommendations.exerciseRecommendations.map((exercise, index) => (
                  <li key={`exercise-${index}`} className="p-2 border rounded-md bg-muted/20 space-y-2">
                    <div className="font-medium">{exercise}</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Duration (min)"
                        className="h-8 text-xs flex-grow"
                        value={exerciseDurations[index] || ""}
                        onChange={(e) => setExerciseDurations(prev => ({ ...prev, [index]: e.target.value }))}
                        min="1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLogExercise(exercise, index)}
                        disabled={exerciseLoadingStates[index] || !currentDate || !exerciseDurations[index]?.trim() || parseInt(exerciseDurations[index], 10) <=0}
                      >
                        {exerciseLoadingStates[index] ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="mr-1 h-4 w-4" />}
                        Log
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFetchRecommendations} disabled={isLoading || !userProfile || !userMetrics} className="w-full">
          {isLoading ? "Thinking..." : recommendations ? "Get New Recommendations" : "Get Recommendations"}
        </Button>
      </CardFooter>
    </Card>
  );
}
