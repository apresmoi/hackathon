
// src/components/dashboard/DailySummaryGenerator.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { summarizeDay } from "@/ai/flows/summarize-day-flow";
import type { UserProfile, UserMetrics, StoredDailyLog, DailySummary, AchievementStatus } from "@/lib/types";
import { Loader2, Sparkles, CheckCircle2, TriangleAlert, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailySummaryGeneratorProps {
  userProfile: UserProfile | null;
  userMetrics: UserMetrics | null;
  todaysLog: StoredDailyLog | undefined;
  currentDate: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type AlertVariantType = "default" | "destructive" | "success" | "warning";

export function DailySummaryGenerator({ 
  userProfile, 
  userMetrics, 
  todaysLog, 
  currentDate,
  isOpen,
  onOpenChange
}: DailySummaryGeneratorProps) {
  const [summaryResult, setSummaryResult] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFetchSummary = async () => {
    if (!userProfile || !userMetrics || !todaysLog || !currentDate) {
      setError("Cannot generate summary. Ensure profile is complete and today's log has entries.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input = {
        date: currentDate,
        caloriesConsumed: todaysLog.caloriesConsumed,
        caloriesBurned: todaysLog.caloriesBurned,
        netCalories: todaysLog.netCalories,
        goalCalories: userMetrics.goalCalories,
        userGoal: userProfile.goal,
        loggedMealNames: todaysLog.meals.slice(0, 3).map(m => m.name),
        loggedExerciseNames: todaysLog.exercises.slice(0, 3).map(e => e.name),
      };
      
      const result = await summarizeDay(input);
      setSummaryResult(result);
    } catch (err) {
      console.error("Failed to fetch daily summary:", err);
      setError("Could not fetch daily summary at this time. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to get daily summary.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isLoading && !summaryResult && !error) { 
        if (userProfile && userMetrics && todaysLog && currentDate) {
            handleFetchSummary();
        } else {
            setError("Not enough data to generate a summary. Please complete your profile and log some activities for today.");
        }
    }
    if (!isOpen) { 
        setSummaryResult(null);
        setError(null);
        setIsLoading(false);
    }
  }, [isOpen, userProfile, userMetrics, todaysLog, currentDate]);


  const getIconAndStyle = (status: AchievementStatus | undefined): { Icon: React.ElementType, alertVariant: AlertVariantType } => {
    switch (status) {
      case 'achieved':
        return { Icon: CheckCircle2, alertVariant: "success" };
      case 'nearly_achieved':
        return { Icon: TriangleAlert, alertVariant: "warning" };
      case 'needs_improvement':
        return { Icon: XCircle, alertVariant: "destructive" };
      default:
        return { Icon: Sparkles, alertVariant: "default" };
    }
  };

  const { Icon, alertVariant } = getIconAndStyle(summaryResult?.achievementStatus);

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Today's Pulse Check
          </AlertDialogTitle>
          {(!isLoading && !error && !summaryResult) && (
            <AlertDialogDescription>
              Click "Refresh Pulse" to get your AI-powered summary.
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        
        <div className="my-4">
          {isLoading && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Generating your daily pulse...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {summaryResult && !isLoading && (
            <Alert variant={alertVariant}>
              <Icon className="h-5 w-5" /> {/* Icon color will be inherited from alertVariant */}
              <AlertTitle className="ml-1">
                {summaryResult.achievementStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </AlertTitle>
              <AlertDescription className="mt-2 whitespace-pre-wrap">
                {summaryResult.summaryText}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button 
            onClick={handleFetchSummary} 
            disabled={isLoading || !userProfile || !userMetrics || !todaysLog || !currentDate}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {summaryResult ? "Refresh Pulse" : "Get Pulse"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
