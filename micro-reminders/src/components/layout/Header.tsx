"use client";

import { useQuery } from '@tanstack/react-query';
import { Zap, Award, TrendingUp, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import type { UserLevelInfo } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchUserLevelInfo(): Promise<UserLevelInfo> {
  const res = await fetch('/api/user/xp');
  if (!res.ok) {
    console.error('Failed to fetch user level info');
    // Provide a sensible default to avoid breaking UI on error
    return { 
      currentLevel: 1, 
      currentLevelLabel: "Beginner", 
      currentXP: 0, 
      xpForCurrentLevelStart: 0, 
      xpForNextLevel: 100, 
      progressPercentage: 0 
    };
  }
  return res.json();
}

export function Header() {
  const { data: userLevelInfo, isLoading: isLoadingXP, error: xpError } = useQuery<UserLevelInfo, Error>({
    queryKey: ['userXP'], // Keep same queryKey as it represents user's XP/level status
    queryFn: fetchUserLevelInfo,
    staleTime: 1000 * 30, // XP/level info fresh for 30 seconds
    refetchInterval: 1000 * 60 * 1, // Refetch every 1 minute
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="MicroReminder Home">
          <Zap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">MicroReminder</span>
        </Link>
        
        <div className="flex items-center space-x-4 text-foreground">
          {isLoadingXP ? (
            <div className="flex flex-col items-end space-y-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-24 mt-1" />
            </div>
          ) : xpError ? (
            <div className="flex items-center text-destructive">
              <ShieldAlert className="mr-2 h-5 w-5" />
              <span className="text-sm">XP Error</span>
            </div>
          ) : userLevelInfo ? (
            <div className="flex flex-col items-end text-right pr-4">
              <div className="flex items-center">
                <Award className="h-6 w-6 text-accent mr-2" />
                <span className="font-semibold text-lg">
                  Level {userLevelInfo.currentLevel} ({userLevelInfo.currentLevelLabel})
                </span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {userLevelInfo.currentXP} / {userLevelInfo.xpForNextLevel} XP
              </span>
              <Progress 
                value={userLevelInfo.progressPercentage} 
                className="w-32 h-1.5 mt-1 bg-muted" 
                indicatorClassName="bg-accent"
              />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
