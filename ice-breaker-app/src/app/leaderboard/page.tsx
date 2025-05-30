import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers, mockIcebreakers, getMockUserById } from '@/lib/mock-data';
import type { User, Icebreaker } from '@/lib/types';
import { Flame, MessageCircle, TrendingUp, Trophy, Medal, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
};

const sortedUsers = [...mockUsers].sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0)).slice(0, 10);
const sortedIcebreakers = [...mockIcebreakers].sort((a, b) => b.interactionCount - a.interactionCount).slice(0, 10);

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground">See who's making waves and breaking the most ice!</p>
      </header>

      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="participants">
            <UsersIcon className="mr-2 h-4 w-4" /> Top Participants
          </TabsTrigger>
          <TabsTrigger value="icebreakers">
            <Flame className="mr-2 h-4 w-4" /> Top Icebreakers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Participants</CardTitle>
              <CardDescription>Ranked by overall activity (entries, comments, likes).</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {sortedUsers.map((user, index) => (
                  <li key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold w-6 text-center">
                        {index < 3 ? (
                          index === 0 ? <Medal className="h-6 w-6 text-yellow-500" /> :
                          index === 1 ? <Medal className="h-6 w-6 text-slate-400" /> :
                          <Medal className="h-6 w-6 text-orange-400" />
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/profile/${user.id}`} className="font-medium hover:underline">{user.displayName}</Link>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-primary">{user.activityScore || 0}</p>
                        <p className="text-xs text-muted-foreground">Activity Score</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icebreakers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Icebreakers</CardTitle>
              <CardDescription>Most engaging icebreaker prompts by interaction count.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {sortedIcebreakers.map((icebreaker, index) => {
                  const author = icebreaker.author || getMockUserById(icebreaker.authorId);
                  return (
                  <li key={icebreaker.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                     <span className="text-lg font-semibold w-6 text-center">
                        {index < 3 ? (
                          index === 0 ? <Medal className="h-6 w-6 text-yellow-500" /> :
                          index === 1 ? <Medal className="h-6 w-6 text-slate-400" /> :
                          <Medal className="h-6 w-6 text-orange-400" />
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author?.avatarUrl} alt={author?.displayName} />
                        <AvatarFallback>{author?.displayName?.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{icebreaker.title}</p>
                        <p className="text-xs text-muted-foreground">By {author?.displayName || 'Unknown'}</p>
                      </div>
                    </div>
                     <div className="text-right">
                        <p className="font-semibold text-primary">{icebreaker.interactionCount}</p>
                        <p className="text-xs text-muted-foreground">Interactions</p>
                    </div>
                  </li>
                )})}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
