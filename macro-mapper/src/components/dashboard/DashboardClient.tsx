
// src/components/dashboard/DashboardClient.tsx
"use client";

import { useUserData } from "@/hooks/useUserData";
import { MetricsDisplay } from "./MetricsDisplay";
import { DailyLogForm } from "./DailyLogForm";
import { DailyLogSummary } from "./DailyLogSummary";
import { CalorieChart } from "./CalorieChart";
import { WeeklyAdjustment } from "./WeeklyAdjustment";
import { PersonalizedRecommendations } from "./PersonalizedRecommendations";
import { DailySummaryGenerator } from "./DailySummaryGenerator"; 
import { ResetDataButton } from "./ResetDataButton";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2, Settings, LogOut } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";

export function DashboardClient() {
  const router = useRouter();
  const {
    userProfile,
    userMetrics,
    isLoading: isUserDataLoading,
    addDailyLogEntry,
    updateDailyLog,
    getLogForDate,
    getRecentLogs,
    resetAllUserData,
  } = useUserData();
  const { toast } = useToast();

  const [todayDateString, setTodayDateString] = useState<string | null>(null);
  const [goalExceededToastShownToday, setGoalExceededToastShownToday] = useState(false);
  const previousDateRef = useRef<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  
  useEffect(() => {
    // This function runs only on the client side
    setTodayDateString(format(new Date(), 'yyyy-MM-dd'));
  }, []);
  
  useEffect(() => {
    if (!isUserDataLoading && !userProfile) {
      router.replace('/onboarding');
    }
  }, [isUserDataLoading, userProfile, router]);

  const todaysLog = todayDateString ? getLogForDate(todayDateString) : undefined;

  useEffect(() => {
    if (todayDateString && previousDateRef.current !== todayDateString) {
      setGoalExceededToastShownToday(false);
      previousDateRef.current = todayDateString;
    }

    if (todaysLog && userMetrics && !goalExceededToastShownToday) {
      if (userProfile?.goal === 'fat_loss' && todaysLog.netCalories > userMetrics.goalCalories) {
         toast({
          title: "Calorie Goal Exceeded!",
          description: `You've consumed ${todaysLog.caloriesConsumed} kcal (net ${todaysLog.netCalories} kcal), which is over your fat loss goal of ${userMetrics.goalCalories} kcal.`,
          variant: "destructive",
          duration: 7000, 
        });
        setGoalExceededToastShownToday(true);
      } else if (userProfile?.goal === 'muscle_gain' && todaysLog.caloriesConsumed < userMetrics.goalCalories && todaysLog.meals.length > 0) { // Check if it's below for muscle gain and meals are logged
        // This part can be tricky, as "under" isn't always a warning for muscle gain unless significantly under for a while.
        // For now, let's only warn on fat_loss overage. A different toast could be for muscle_gain if net is too low.
      }
    }
    if (todaysLog && userMetrics && userProfile?.goal === 'fat_loss' && todaysLog.netCalories <= userMetrics.goalCalories && goalExceededToastShownToday) {
        setGoalExceededToastShownToday(false);
    }

  }, [todaysLog, userMetrics, userProfile, goalExceededToastShownToday, toast, todayDateString]);


  const isLoading = isUserDataLoading || !todayDateString;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AppLogo textSize="text-3xl" />
        <Loader2 className="h-12 w-12 animate-spin text-primary mt-8" />
        <p className="mt-4 text-lg text-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!userProfile || !userMetrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AppLogo textSize="text-3xl" />
        <p className="mt-4 text-lg text-foreground">Loading profile or redirecting...</p>
      </div>
    );
  }
  
  const recentLogs = getRecentLogs(7);
  const isSummaryActionDisabled = !userProfile || !userMetrics || !todaysLog || !todayDateString;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
          <AppLogo textSize="text-2xl" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/onboarding?edit=true')}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                resetAllUserData();
                router.push('/onboarding');
              }} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout & Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <MetricsDisplay metrics={userMetrics} profile={userProfile} isLoading={isUserDataLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DailyLogSummary 
                log={todaysLog} 
                userMetrics={userMetrics} 
                userProfile={userProfile} // Pass userProfile here
                isLoading={isUserDataLoading} 
                onUpdateLog={updateDailyLog}
                onOpenSummaryDialog={() => setIsSummaryDialogOpen(true)}
                isSummaryActionDisabled={isSummaryActionDisabled}
              />
              <CalorieChart dailyLogs={recentLogs} userMetrics={userMetrics} isLoading={isUserDataLoading} />
            </div>
            <div className="space-y-6">
              {todayDateString && <DailyLogForm currentDate={todayDateString} onAddEntry={addDailyLogEntry} /> }
              <PersonalizedRecommendations 
                userProfile={userProfile} 
                userMetrics={userMetrics} 
                addDailyLogEntry={addDailyLogEntry}
                currentDate={todayDateString}
              />
              <WeeklyAdjustment recentLogs={recentLogs} userMetrics={userMetrics} userProfile={userProfile} isLoading={isUserDataLoading} />
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t">
             <ResetDataButton />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {AppLogo.name || "MacroMapper"}. Stay Healthy!
      </footer>

      {/* Daily Summary Dialog */}
      <DailySummaryGenerator
        isOpen={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        userProfile={userProfile}
        userMetrics={userMetrics}
        todaysLog={todaysLog}
        currentDate={todayDateString}
      />
    </div>
  );
}

