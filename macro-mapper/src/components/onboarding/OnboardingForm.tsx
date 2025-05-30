// src/components/onboarding/OnboardingForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserData } from "@/hooks/useUserData";
import { ACTIVITY_LEVELS, GOALS, GENDERS } from "@/lib/constants";
import type { UserProfile, ActivityLevelKey, Goal, Gender } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const onboardingFormSchema = z.object({
  age: z.coerce.number().min(12, "Must be at least 12 years old").max(100, "Must be at most 100 years old"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  goal: z.enum(["fat_loss", "muscle_gain", "maintenance"], { required_error: "Goal is required" }),
  activityLevel: z.enum(["sedentary", "lightlyActive", "moderatelyActive", "veryActive"], { required_error: "Activity level is required" }),
  dietaryRestrictions: z.string().optional(),
  preferences: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const { setUserProfile } = useUserData();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      age: 25,
      gender: undefined,
      height: 170,
      weight: 70,
      goal: undefined,
      activityLevel: undefined,
      dietaryRestrictions: "",
      preferences: "",
    },
  });

  function onSubmit(data: OnboardingFormValues) {
    try {
      const profileData: UserProfile = {
        ...data,
        gender: data.gender as Gender,
        goal: data.goal as Goal,
        activityLevel: data.activityLevel as ActivityLevelKey,
        dietaryRestrictions: data.dietaryRestrictions?.split(',').map(s => s.trim()).filter(Boolean) || [],
        preferences: data.preferences?.split(',').map(s => s.trim()).filter(Boolean) || [],
      };
      setUserProfile(profileData);
      toast({
        title: "Profile Created!",
        description: "Welcome to MacroMapper! Let's get started.",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile", error);
      toast({
        title: "Error",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle>Welcome to MacroMapper!</CardTitle>
        <CardDescription>Tell us a bit about yourself to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 170" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Goal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOALS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ACTIVITY_LEVELS).map(([key, details]) => (
                        <SelectItem key={key} value={key}>
                          {details.label} <span className="text-xs text-muted-foreground ml-1">({details.description})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., vegetarian, gluten-free, dairy-free (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter any dietary restrictions, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food/Exercise Preferences (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., high protein, quick meals, running, weightlifting (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter any preferences, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
