// src/components/dashboard/MetricsDisplay.tsx
"use client";

import type { UserMetrics, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricsDisplayProps {
  metrics: UserMetrics | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

const MetricItem: React.FC<{ label: string; value: string | number; unit?: string; tooltip?: string }> = ({ label, value, unit, tooltip }) => (
  <div className="flex flex-col p-3 bg-secondary/50 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <span className="text-2xl font-semibold text-primary">
      {value} <span className="text-sm text-foreground">{unit}</span>
    </span>
  </div>
);


export function MetricsDisplay({ metrics, profile, isLoading }: MetricsDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col p-3 bg-secondary/50 rounded-lg">
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!metrics || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Metrics</CardTitle>
          <CardDescription>Complete your profile to see your metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No metrics available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Your Current Metrics</CardTitle>
        <CardDescription>Based on your profile: {profile.age} y/o {profile.gender}, {profile.height}cm, {profile.weight}kg.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricItem label="BMI" value={metrics.bmi} tooltip="Body Mass Index" />
        <MetricItem label="BMR" value={metrics.bmr} unit="kcal" tooltip="Basal Metabolic Rate - calories burned at rest" />
        <MetricItem label="TDEE" value={metrics.tdee} unit="kcal" tooltip="Total Daily Energy Expenditure - estimated daily calorie burn" />
        <MetricItem label="Goal Calories" value={metrics.goalCalories} unit="kcal" tooltip="Target daily calories for your goal" />
      </CardContent>
    </Card>
  );
}
