// src/components/dashboard/CalorieChart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StoredDailyLog, UserMetrics } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

interface CalorieChartProps {
  dailyLogs: StoredDailyLog[];
  userMetrics: UserMetrics | null;
  isLoading: boolean;
}

const chartConfig = {
  netCalories: {
    label: "Net Calories (kcal)",
    color: "hsl(var(--primary))",
  },
  goalCalories: {
    label: "Goal Calories (kcal)",
    color: "hsl(var(--accent))",
  }
};

export function CalorieChart({ dailyLogs, userMetrics, isLoading }: CalorieChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const chartData = dailyLogs.map(log => ({
    date: format(parseISO(log.date), "MMM d"),
    netCalories: log.netCalories,
    goalCalories: userMetrics?.goalCalories || 0,
  }));

  if (dailyLogs.length === 0) {
    return (
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Calorie Trends</CardTitle>
          <CardDescription>Your net calorie intake over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Not enough data to display chart. Start logging your days!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Calorie Trends</CardTitle>
        <CardDescription>Your net calorie intake over the last 7 days compared to your goal.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)} // Shorten date format for X-axis
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="netCalories" fill="var(--color-netCalories)" radius={4} />
            {userMetrics && <Bar dataKey="goalCalories" fill="var(--color-goalCalories)" radius={4} barSize={5} opacity={0.5} />}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
