
// src/components/dashboard/DailyLogForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MealLog, ExerciseLog, DailyLog } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Utensils, Dumbbell, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { estimateMealNutrition } from "@/ai/flows/estimate-meal-nutrition-flow";
import { estimateExerciseCalories } from "@/ai/flows/estimate-exercise-calories-flow";

interface DailyLogFormProps {
  currentDate: string; // YYYY-MM-DD
  onAddEntry: (date: string, entry: Omit<DailyLog, 'date' | 'caloriesConsumed' | 'caloriesBurned' | 'netCalories'>) => void;
}

const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  calories: z.coerce.number().min(0, "Calories must be positive"),
  protein: z.coerce.number().min(0, "Protein must be positive").optional(),
  carbs: z.coerce.number().min(0, "Carbs must be positive").optional(),
  fats: z.coerce.number().min(0, "Fats must be positive").optional(),
});

const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  caloriesBurned: z.coerce.number().min(0, "Calories burned must be positive"),
});

const notesSchema = z.object({
  notes: z.string().optional(),
});

type MealFormValues = z.infer<typeof mealSchema>;
type ExerciseFormValues = z.infer<typeof exerciseSchema>;
type NotesFormValues = z.infer<typeof notesSchema>;

export function DailyLogForm({ currentDate, onAddEntry }: DailyLogFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("meal");
  const [isFetchingMealSuggestion, setIsFetchingMealSuggestion] = useState(false);
  const [isFetchingExerciseSuggestion, setIsFetchingExerciseSuggestion] = useState(false);

  const mealForm = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: { name: "", calories: 0, protein: 0, carbs: 0, fats: 0 },
  });

  const exerciseForm = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: "", duration: 0, caloriesBurned: 0 },
  });

  const notesForm = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: { notes: "" },
  });

  const handleAddMeal = (data: MealFormValues) => {
    const newMeal: MealLog = { ...data, id: uuidv4(), protein: data.protein || 0, carbs: data.carbs || 0, fats: data.fats || 0 };
    onAddEntry(currentDate, { meals: [newMeal], exercises: [] });
    toast({ title: "Meal Added", description: `${data.name} logged.` });
    mealForm.reset();
  };

  const handleAddExercise = (data: ExerciseFormValues) => {
    const newExercise: ExerciseLog = { ...data, id: uuidv4() };
    onAddEntry(currentDate, { meals: [], exercises: [newExercise] });
    toast({ title: "Exercise Added", description: `${data.name} logged.` });
    exerciseForm.reset();
  };

  const handleSaveNotes = (data: NotesFormValues) => {
     onAddEntry(currentDate, { meals: [], exercises: [], notes: data.notes });
     toast({ title: "Notes Saved", description: "Your notes for today have been updated." });
  }

  const handleFetchNutritionSuggestion = async () => {
    const mealName = mealForm.getValues("name");
    if (!mealName.trim()) {
      toast({
        title: "Meal Name Required",
        description: "Please enter a meal name before fetching suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingMealSuggestion(true);
    try {
      const suggestion = await estimateMealNutrition({ mealName });
      mealForm.setValue("calories", suggestion.calories, { shouldValidate: true });
      mealForm.setValue("protein", suggestion.protein, { shouldValidate: true });
      mealForm.setValue("carbs", suggestion.carbs, { shouldValidate: true });
      mealForm.setValue("fats", suggestion.fats, { shouldValidate: true });
      toast({
        title: "Nutrition Suggested",
        description: `AI has estimated values for ${mealName}. Please review.`,
      });
    } catch (error) {
      console.error("Error fetching nutrition suggestion:", error);
      toast({
        title: "Suggestion Error",
        description: "Could not fetch nutrition suggestions at this time.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingMealSuggestion(false);
    }
  };

  const handleFetchExerciseSuggestion = async () => {
    const exerciseName = exerciseForm.getValues("name");
    const durationValue = exerciseForm.getValues("duration"); // Can be string or number from input

    if (!exerciseName.trim()) {
      toast({
        title: "Exercise Name Required",
        description: "Please enter an exercise name.",
        variant: "destructive",
      });
      return;
    }

    // Ensure duration is a number and valid before calling the AI flow
    const duration = typeof durationValue === 'string' ? parseFloat(durationValue) : Number(durationValue);

    if (isNaN(duration) || duration < 1) {
      toast({
        title: "Valid Duration Required",
        description: "Please enter a duration of at least 1 minute.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingExerciseSuggestion(true);
    try {
      // Pass the explicitly numeric duration to the AI flow
      const suggestion = await estimateExerciseCalories({ exerciseName, duration });
      exerciseForm.setValue("caloriesBurned", suggestion.caloriesBurned, { shouldValidate: true });
      toast({
        title: "Calories Burned Suggested",
        description: `AI has estimated calories burned for ${exerciseName}. Please review.`,
      });
    } catch (error) {
      console.error("Error fetching exercise calorie suggestion:", error);
      toast({
        title: "Suggestion Error",
        description: "Could not fetch exercise calorie suggestions at this time.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingExerciseSuggestion(false);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Log for {format(new Date(currentDate + "T00:00:00"), "MMMM d, yyyy")}</CardTitle>
        <CardDescription>Add your meals, exercises, and notes for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meal"><Utensils className="mr-2 h-4 w-4" />Meal</TabsTrigger>
            <TabsTrigger value="exercise"><Dumbbell className="mr-2 h-4 w-4" />Exercise</TabsTrigger>
            <TabsTrigger value="notes"><PlusCircle className="mr-2 h-4 w-4" />Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meal" className="mt-4">
            <Form {...mealForm}>
              <form onSubmit={mealForm.handleSubmit(handleAddMeal)} className="space-y-4">
                <FormField name="name" control={mealForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Name</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl><Input placeholder="e.g., Chicken Salad" {...field} /></FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleFetchNutritionSuggestion}
                        disabled={isFetchingMealSuggestion || !mealForm.watch("name").trim()}
                        aria-label="Get AI Nutrition Suggestion"
                      >
                        {isFetchingMealSuggestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField name="calories" control={mealForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 350" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="protein" control={mealForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField name="carbs" control={mealForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 20" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="fats" control={mealForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fats (g)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 15" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={mealForm.formState.isSubmitting || isFetchingMealSuggestion}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Meal
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="exercise" className="mt-4">
            <Form {...exerciseForm}>
              <form onSubmit={exerciseForm.handleSubmit(handleAddExercise)} className="space-y-4">
                <FormField name="name" control={exerciseForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Name</FormLabel>
                     <div className="flex items-center gap-2">
                        <FormControl><Input placeholder="e.g., Running" {...field} /></FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleFetchExerciseSuggestion}
                          disabled={isFetchingExerciseSuggestion || !exerciseForm.watch("name").trim() || Number(exerciseForm.watch("duration")) < 1}
                          aria-label="Get AI Calorie Burn Suggestion"
                        >
                          {isFetchingExerciseSuggestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </Button>
                      </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField name="duration" control={exerciseForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="caloriesBurned" control={exerciseForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories Burned (kcal)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={exerciseForm.formState.isSubmitting || isFetchingExerciseSuggestion}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4">
            <Form {...notesForm}>
              <form onSubmit={notesForm.handleSubmit(handleSaveNotes)} className="space-y-4">
                <FormField name="notes" control={notesForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How are you feeling today? Any reflections on your diet or workout?" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={notesForm.formState.isSubmitting}>
                   Save Notes
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

