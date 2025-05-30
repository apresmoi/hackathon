// This page represents the current user's profile.
// For specific user profiles by ID, use /profile/[id]/page.tsx
'use client'; // Needs to be client for potential client-side data fetching / state

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label'; // Added import
import { currentMockUser, mockEntries } from '@/lib/mock-data'; // Using mock user for now
import type { Entry } from '@/lib/types';
import { Mail, Briefcase, BarChart3, ThermometerSnowflake, ThermometerSun, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

// Cannot use export const metadata on client component.
// This page should have a title like "My Profile" set in a parent server component or layout if dynamic title is needed.

const UserActivityCard = ({ title, count, icon: Icon }: { title: string; count: number; icon: React.ElementType }) => (
  <Card className="bg-muted/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{count}</div>
    </CardContent>
  </Card>
);

export default function ProfilePage() {
  const user = currentMockUser; // In a real app, fetch current user data

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>User not found or not logged in.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Feed</Link>
        </Button>
      </div>
    );
  }

  const userEntries = mockEntries.filter(entry => entry.authorId === user.id);
  const userCommentsCount = mockEntries.reduce((sum, entry) => {
    return sum + entry.comments.filter(comment => comment.authorId === user.id).length;
  }, 0);

  const iceLevel = user.iceLevel; // 0 (melted) to 100 (frozen)
  const iceLevelProgress = 100 - iceLevel; // Progress bar shows how much "melted"
  
  // Hue for thermometer: 0 (red, melted) to 200 (blue, frozen)
  const hue = (iceLevel / 100) * 200; 
  const thermometerFillStyle = { backgroundColor: `hsl(${hue}, 80%, 60%)` };


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-accent" data-ai-hint="abstract pattern" />
        <CardHeader className="flex flex-col items-center text-center -mt-16">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback className="text-3xl">{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-2xl">{user.displayName}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Briefcase className="h-3 w-3"/> Role: {user.role}
          </CardDescription>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Mail className="h-3 w-3"/> {user.email}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="mt-4">
            <Label htmlFor="iceLevel" className="text-sm font-medium">Ice Level ({iceLevel}%)</Label>
            <div className="flex items-center space-x-2 mt-1">
              <ThermometerSun className="h-5 w-5 text-orange-400" />
              <Progress id="iceLevel" value={iceLevelProgress} className="h-3 flex-1" indicatorClassName="transition-all duration-500 ease-out" style={thermometerFillStyle} />
              <ThermometerSnowflake className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {iceLevel === 0 ? "Fully Melted! You're on fire!" : iceLevel === 100 ? "Still Frozen! Time to break the ice." : "Keep melting that ice!"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary"/> Activity Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
           <UserActivityCard title="Icebreakers Posted" count={userEntries.length} icon={Mail} />
           <UserActivityCard title="Comments Made" count={userCommentsCount} icon={MessageSquare} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>My Recent Activity</CardTitle>
          <CardDescription>Your latest icebreaker entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {userEntries.length > 0 ? (
            <ul className="space-y-3">
              {userEntries.slice(0, 5).map(entry => (
                <li key={entry.id} className="p-3 bg-muted/30 rounded-md text-sm">
                  <Link href={`/#icebreaker-${entry.icebreakerId}`} className="hover:underline"> {/* Placeholder link to feed item */}
                    <p className="font-medium">Entry for Icebreaker ID: {entry.icebreakerId}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.text || "Image entry"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Go post an icebreaker!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
