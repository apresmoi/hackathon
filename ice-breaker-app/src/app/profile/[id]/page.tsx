// This page represents a specific user's profile, viewable by others.
'use client'; 

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label'; // Added import
import { mockUsers, mockEntries, getMockUserById } from '@/lib/mock-data';
import type { User, Entry } from '@/lib/types';
import { Mail, Briefcase, BarChart3, ThermometerSnowflake, ThermometerSun, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined for loading state

  useEffect(() => {
    if (userId) {
      const foundUser = getMockUserById(userId);
      setUser(foundUser || null); // null if not found
    }
  }, [userId]);
  
  // Dynamic title would be set in a server component wrapping this if needed.
  // For simplicity, document.title could be updated in useEffect.
  useEffect(() => {
    if (user) {
      document.title = `${user.displayName} | Profile`;
    } else if (user === null) {
      document.title = `User Not Found | Profile`;
    }
  }, [user]);


  if (user === undefined) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">User Not Found</h2>
        <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
        <Button asChild className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4"/> Go Back
        </Button>
      </div>
    );
  }

  const userEntries = mockEntries.filter(entry => entry.authorId === user.id);
  const userCommentsCount = mockEntries.reduce((sum, entry) => {
    return sum + entry.comments.filter(comment => comment.authorId === user.id).length;
  }, 0);
  
  const iceLevel = user.iceLevel;
  const iceLevelProgress = 100 - iceLevel;
  const hue = (iceLevel / 100) * 200; 
  const thermometerFillStyle = { backgroundColor: `hsl(${hue}, 80%, 60%)` };

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4"/> Back
      </Button>
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-accent" data-ai-hint="abstract waves" />
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
              {iceLevel === 0 ? "Fully Melted!" : iceLevel === 100 ? "Still Frozen!" : "Melting..."}
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
          <CardTitle>{user.displayName}'s Recent Activity</CardTitle>
          <CardDescription>Latest icebreaker entries by this user.</CardDescription>
        </CardHeader>
        <CardContent>
          {userEntries.length > 0 ? (
            <ul className="space-y-3">
              {userEntries.slice(0, 5).map(entry => (
                <li key={entry.id} className="p-3 bg-muted/30 rounded-md text-sm">
                  <Link href={`/#icebreaker-${entry.icebreakerId}`} className="hover:underline">
                    <p className="font-medium">Entry for Icebreaker ID: {entry.icebreakerId}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.text || "Image entry"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">This user has no activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
