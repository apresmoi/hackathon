
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Filter, Search, ThumbsUp, Sparkles, ListChecks, Zap } from 'lucide-react'; // Added ListChecks & Zap
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { useFirebase } from '@/components/providers/firebase-provider';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import type { Chore, ChoreStatus, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateFairRewardPoints } from '@/ai/flows/generate-fair-reward-points';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';

function ChoreCard({ chore, currentUserId, onClaim, onComplete, onSetDislike }: { 
  chore: Chore; 
  currentUserId: string | undefined;
  onClaim: (choreId: string) => Promise<void>;
  onComplete: (choreId: string) => Promise<void>;
  onSetDislike: (choreId: string, value: number) => Promise<void>;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dislikeValue, setDislikeValue] = useState(chore.dislikeValues?.[currentUserId || ''] || 5);
  const [showDislikeSlider, setShowDislikeSlider] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetDislike = async () => {
    if (!currentUserId) return;
    await handleAction(() => onSetDislike(chore.id, dislikeValue));
    setShowDislikeSlider(false);
  };

  const userCanClaim = chore.status === 'Available' && currentUserId;
  const userCanComplete = chore.status === 'In Progress' && chore.assignedTo === currentUserId;
  const userHasSetDislike = currentUserId && chore.dislikeValues?.[currentUserId] !== undefined;
  const isUrgent = chore.urgencyBonus && chore.urgencyBonus > 0 && chore.status !== 'Completed';

  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <Link href={`/chores/${chore.id}`} className="hover:underline">
              <CardTitle className="text-xl">{chore.title}</CardTitle>
            </Link>
            {isUrgent && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 w-fit">
                  <Zap className="mr-1 h-3 w-3" /> Urgent (+{chore.urgencyBonus} pts)
                </Badge>
            )}
          </div>
          <Badge variant={chore.status === 'Completed' ? 'default' : chore.status === 'In Progress' ? 'secondary' : 'outline'}>
            {chore.status}
          </Badge>
        </div>
        {chore.description && <CardDescription className="mt-1">{chore.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-sm text-muted-foreground">
          Due: {chore.dueDate ? new Date(chore.dueDate as string).toLocaleDateString() : 'N/A'}
        </p>
        <p className="text-sm text-muted-foreground">Recurrence: {chore.recurrence}</p>
        {chore.rewardPoints && chore.status === 'Completed' && (
          <p className="text-sm font-semibold text-primary">Points Awarded: {chore.rewardPoints}</p>
        )}
        {chore.assignedTo && chore.status === 'In Progress' && (
          <p className="text-sm text-muted-foreground">Claimed by: You</p> // This needs to fetch display name
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="flex-grow">
          {currentUserId && chore.status !== 'Completed' && !userHasSetDislike && !showDislikeSlider && (
             <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowDislikeSlider(true)}>
                <ThumbsUp className="mr-2 h-4 w-4" /> Set Dislike
              </Button>
          )}
          {showDislikeSlider && (
            <div className="space-y-3 p-2 border rounded-md bg-background">
              <Label htmlFor={`dislike-${chore.id}`} className="text-sm">Your Dislike: {dislikeValue}</Label>
              <Slider
                id={`dislike-${chore.id}`}
                min={1} max={10} step={1}
                defaultValue={[dislikeValue]}
                onValueChange={(value) => setDislikeValue(value[0])}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSetDislike} disabled={isLoading}>Save Dislike</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowDislikeSlider(false)}>Cancel</Button>
              </div>
            </div>
          )}
           {userHasSetDislike && chore.status !== 'Completed' && (
            <p className="text-sm text-muted-foreground italic">Your dislike: {chore.dislikeValues[currentUserId!]}</p>
           )}
        </div>
        <div className="flex gap-2">
          {userCanClaim && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto" disabled={isLoading || !userHasSetDislike}>
                  <Sparkles className="mr-2 h-4 w-4" /> Claim
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Claim Chore: {chore.title}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will assign the chore to you. Make sure you're ready to tackle it!
                    {!userHasSetDislike && " You must set your dislike value before claiming."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(() => onClaim(chore.id))} disabled={!userHasSetDislike}>
                    Claim Chore
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {userCanComplete && (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
                  Complete Chore
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Complete Chore: {chore.title}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Marking this chore as complete will award you points based on others' dislike values.
                    {chore.urgencyBonus && chore.urgencyBonus > 0 ? ` An additional ${chore.urgencyBonus} points will be awarded for urgent completion.` : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(() => onComplete(chore.id))} className="bg-green-500 hover:bg-green-600">
                    Mark as Complete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ChoresPage() {
  const { userProfile, isAdmin, currentUser } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [chores, setChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChoreStatus | 'all'>('all');
  // const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'thisWeek'>('all');

  useEffect(() => {
    if (!db || !userProfile?.familyId) {
      setIsLoading(false); // if no db or familyId, nothing to load
      return;
    }
    setIsLoading(true);
    const q = query(collection(db, 'chores'), where('familyId', '==', userProfile.familyId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const choresData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chore));
      setChores(choresData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching chores:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch chores.' });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, userProfile?.familyId, toast]);

  const handleClaimChore = async (choreId: string) => {
    if (!db || !currentUser) return;
    const choreRef = doc(db, 'chores', choreId);
    await updateDoc(choreRef, {
      status: 'In Progress',
      assignedTo: currentUser.uid,
      updatedAt: new Date().toISOString(),
    });
    toast({ title: 'Chore Claimed!', description: 'You have successfully claimed the chore.' });
  };

  const handleCompleteChore = async (choreId: string) => {
    if (!db || !currentUser || !userProfile?.familyId) return;

    const choreRef = doc(db, 'chores', choreId);
    const choreSnap = await getDoc(choreRef);
    if (!choreSnap.exists()) {
      throw new Error("Chore not found");
    }
    const choreData = choreSnap.data() as Chore;

    // Get dislike values from other family members
    const otherDislikeValues = Object.entries(choreData.dislikeValues || {})
      .filter(([userId]) => userId !== currentUser.uid)
      .map(([, value]) => value);
    
    let pointsEarned = 0;
    if (otherDislikeValues.length > 0) {
      const aiResult = await generateFairRewardPoints({ dislikeValues: otherDislikeValues });
      pointsEarned = aiResult.rewardPoints;
    } else {
      pointsEarned = choreData.dislikeValues?.[currentUser.uid] || 1; 
    }
    
    let bonusMessage = '';
    if (choreData.urgencyBonus && choreData.urgencyBonus > 0) {
      pointsEarned += choreData.urgencyBonus;
      bonusMessage = ` You also received +${choreData.urgencyBonus} urgency bonus points!`;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error("User profile not found");
    }
    const currentUserData = userSnap.data() as UserProfile;
    const newTotalPoints = (currentUserData.points || 0) + pointsEarned;

    const batch = writeBatch(db);
    batch.update(choreRef, {
      status: 'Completed',
      completedBy: currentUser.uid,
      rewardPoints: pointsEarned,
      updatedAt: new Date().toISOString(),
    });
    batch.update(userRef, {
      points: newTotalPoints,
    });
    
    await batch.commit();
    toast({ title: 'Chore Completed!', description: `You earned ${pointsEarned} points!${bonusMessage}` });
  };

  const handleSetDislikeValue = async (choreId: string, value: number) => {
    if (!db || !currentUser) return;
    const choreRef = doc(db, 'chores', choreId);
    
    const dislikeField = `dislikeValues.${currentUser.uid}`; 
    await updateDoc(choreRef, {
      [dislikeField]: value,
      updatedAt: new Date().toISOString(),
    });
    toast({ title: 'Dislike Value Set!', description: `Your dislike for this chore is now ${value}.` });
  };


  const filteredChores = useMemo(() => {
    return chores
      .filter(chore => {
        const matchesSearch = chore.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              chore.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || chore.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => { 
        const statusOrder: Record<ChoreStatus, number> = { 'Available': 1, 'In Progress': 2, 'Completed': 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        // Prioritize urgent chores within each status group
        const urgencyA = (a.urgencyBonus && a.urgencyBonus > 0 && a.status !== 'Completed') ? 1 : 0;
        const urgencyB = (b.urgencyBonus && b.urgencyBonus > 0 && b.status !== 'Completed') ? 1 : 0;
        if (urgencyA !== urgencyB) {
          return urgencyB - urgencyA; // Urgent chores first (higher value for urgencyA means it comes earlier)
        }
        const dateA = a.dueDate ? new Date(a.dueDate as string).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate as string).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [chores, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chores</h1>
          <p className="text-muted-foreground">Manage and track all family chores.</p>
        </div>
        {isAdmin && (
          <Link href="/chores/new" passHref>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Chore
            </Button>
          </Link>
        )}
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search chores..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ChoreStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                  <CardFooter><div className="h-10 bg-muted rounded w-1/2"></div></CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredChores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredChores.map(chore => (
                <ChoreCard 
                  key={chore.id} 
                  chore={chore} 
                  currentUserId={currentUser?.uid}
                  onClaim={handleClaimChore}
                  onComplete={handleCompleteChore}
                  onSetDislike={handleSetDislikeValue}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold">No Chores Found</h3>
              <p className="mt-1 text-muted-foreground">Try adjusting your filters or add new chores.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
