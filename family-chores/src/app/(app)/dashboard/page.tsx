
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ListChecks, Star, CheckCircle, Clock, Users, PlusCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useFirebase } from '@/components/providers/firebase-provider';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, doc } from 'firebase/firestore'; // Added doc here
import type { Chore, Activity, UserProfile } from '@/lib/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Dummy data for recent activity - replace with actual data fetching
const dummyActivities: Activity[] = [
  { id: '1', familyId: 'fam1', userId: 'user1', userName: 'Alice', action: 'completed Laundry', choreTitle: 'Laundry', pointsEarned: 5, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', familyId: 'fam1', userId: 'user2', userName: 'Bob', action: 'claimed Dishwashing', choreTitle: 'Dishwashing', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', familyId: 'fam1', userId: 'user1', userName: 'Alice', action: 'earned 3 points for Taking out trash', choreTitle: 'Taking out trash', pointsEarned: 3, timestamp: new Date(Date.now() - 10800000).toISOString() },
];

export default function DashboardPage() {
  const { userProfile, isAdmin } = useAuth();
  const { db } = useFirebase();
  const [userStats, setUserStats] = useState({ choresCompleted: 0, points: 0 });
  const [recentChores, setRecentChores] = useState<Chore[]>([]);
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<Activity[]>(dummyActivities); // Use dummy for now
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userProfile && db) {
      setIsLoading(true);
      setUserStats({
        choresCompleted: 0, // This would typically be calculated from completed chores
        points: userProfile.points || 0,
      });

      const fetchDashboardData = async () => {
        try {
          // Fetch recent chores (assigned to user or available)
          const choresQuery = query(
            collection(db, 'chores'),
            where('familyId', '==', userProfile.familyId),
            // where('status', '!=', 'Completed'), // Example: show active chores
            orderBy('dueDate', 'asc'),
            limit(5)
          );
          const choresSnapshot = await getDocs(choresQuery);
          const choresData = choresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chore));
          setRecentChores(choresData);

          // Fetch family members if admin
          if (isAdmin && userProfile.familyId) {
            const membersQuery = query(
              collection(db, 'users'),
              where('familyId', '==', userProfile.familyId)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const membersData = membersSnapshot.docs.map(doc => doc.data() as UserProfile);
            setFamilyMembers(membersData);
          }
          
          // Fetch recent activities (replace with real listener later)
          // For now, using dummy data. A real implementation would use onSnapshot:
          // const activitiesQuery = query(collection(db, 'activities'), where('familyId', '==', userProfile.familyId), orderBy('timestamp', 'desc'), limit(5));
          // onSnapshot(activitiesQuery, (snapshot) => { ... setActivities ... });

        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
      
      // Setup snapshot listener for user profile points
      const userDocRef = doc(db, "users", userProfile.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedProfile = docSnap.data() as UserProfile;
          setUserStats(prev => ({ ...prev, points: updatedProfile.points || 0 }));
        }
      });
      
      return () => {
        unsubscribeUser();
      };

    } else if (!userProfile && !db) { // Handles case where firebase is not ready
      setIsLoading(true);
    } else { // Handles case where there is no user profile (e.g. after logout before redirect)
      setIsLoading(false);
    }
  }, [userProfile, db, isAdmin]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><ListChecks className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {userProfile?.displayName || 'User'}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your family.</p>
        </div>
        {isAdmin && (
          <Link href="/chores/new" passHref>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Chore
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{userStats.points}</div>
            <p className="text-xs text-muted-foreground">Points you've earned so far</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chores Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userStats.choresCompleted}</div>
            <p className="text-xs text-muted-foreground">Total chores you've marked complete</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{familyMembers.length > 0 ? familyMembers.length : '1+'}</div>
             <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Members in your family' : 'Part of your awesome family'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming / Active Chores</CardTitle>
            <CardDescription>Chores needing attention soon.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentChores.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentChores.map((chore) => (
                    <TableRow key={chore.id}>
                      <TableCell className="font-medium">
                        <Link href={`/chores/${chore.id}`} className="hover:underline text-primary">
                          {chore.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={chore.status === 'Completed' ? 'default' : chore.status === 'In Progress' ? 'secondary' : 'outline'}>
                          {chore.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{chore.dueDate ? new Date(chore.dueDate as string).toLocaleDateString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming or active chores. Well done!</p>
            )}
            <div className="mt-4 text-center">
              <Link href="/chores" passHref>
                <Button variant="outline">View All Chores</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest happenings in your family.</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.action.includes('completed') || activity.action.includes('earned') ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.userName}</span> {activity.action}
                        {activity.choreTitle && <span className="text-primary"> "{activity.choreTitle}"</span>}
                        {activity.pointsEarned && ` and earned ${activity.pointsEarned} points`}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp as string), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


    