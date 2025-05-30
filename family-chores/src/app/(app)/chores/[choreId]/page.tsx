'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { useFirebase } from '@/components/providers/firebase-provider';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Chore, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Sparkles, ThumbsUp, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFairRewardPoints } from '@/ai/flows/generate-fair-reward-points';
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
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

export default function ChoreDetailPage() {
  const params = useParams();
  const choreId = params.choreId as string;
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [chore, setChore] = useState<Chore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dislikeValue, setDislikeValue] = useState(5);
  const [showDislikeSlider, setShowDislikeSlider] = useState(false);

  useEffect(() => {
    if (db && choreId) {
      const fetchChore = async () => {
        setIsLoading(true);
        const choreRef = doc(db, 'chores', choreId);
        const choreSnap = await getDoc(choreRef);
        if (choreSnap.exists()) {
          const choreData = { id: choreSnap.id, ...choreSnap.data() } as Chore;
          setChore(choreData);
          if (currentUser && choreData.dislikeValues?.[currentUser.uid]) {
            setDislikeValue(choreData.dislikeValues[currentUser.uid]);
          }
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Chore not found.' });
          router.push('/chores');
        }
        setIsLoading(false);
      };
      fetchChore();
    }
  }, [db, choreId, router, toast, currentUser]);

  const handleClaimChore = async () => {
    if (!db || !currentUser || !chore) return;
    setActionLoading(true);
    const choreRef = doc(db, 'chores', chore.id);
    try {
      await updateDoc(choreRef, {
        status: 'In Progress',
        assignedTo: currentUser.uid,
        updatedAt: new Date().toISOString(),
      });
      setChore(prev => prev ? { ...prev, status: 'In Progress', assignedTo: currentUser.uid } : null);
      toast({ title: 'Chore Claimed!', description: 'You have successfully claimed the chore.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteChore = async () => {
    if (!db || !currentUser || !chore || !userProfile?.familyId) return;
    setActionLoading(true);
    
    const choreRef = doc(db, 'chores', chore.id);
    const otherDislikeValues = Object.entries(chore.dislikeValues || {})
      .filter(([userId]) => userId !== currentUser.uid)
      .map(([, value]) => value);
    
    let pointsEarned = 0;
    if (otherDislikeValues.length > 0) {
      const aiResult = await generateFairRewardPoints({ dislikeValues: otherDislikeValues });
      pointsEarned = aiResult.rewardPoints;
    } else {
      pointsEarned = chore.dislikeValues?.[currentUser.uid] || 1;
    }
    
    let bonusMessage = '';
    if (chore.urgencyBonus && chore.urgencyBonus > 0) {
      pointsEarned += chore.urgencyBonus;
      bonusMessage = ` You also received +${chore.urgencyBonus} urgency bonus points!`;
    }
    
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        toast({ variant: 'destructive', title: 'Error', description: 'User profile not found.' });
        setActionLoading(false);
        return;
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
    
    try {
      await batch.commit();
      setChore(prev => prev ? { ...prev, status: 'Completed', completedBy: currentUser.uid, rewardPoints: pointsEarned } : null);
      toast({ title: 'Chore Completed!', description: `You earned ${pointsEarned} points!${bonusMessage}` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleSetDislike = async () => {
    if (!db || !currentUser || !chore) return;
    setActionLoading(true);
    const choreRef = doc(db, 'chores', chore.id);
    const dislikeField = `dislikeValues.${currentUser.uid}`;
    try {
      await updateDoc(choreRef, {
        [dislikeField]: dislikeValue,
        updatedAt: new Date().toISOString(),
      });
      setChore(prev => prev ? { ...prev, dislikeValues: { ...prev.dislikeValues, [currentUser.uid]: dislikeValue } } : null);
      toast({ title: 'Dislike Value Set!', description: `Your dislike for this chore is now ${dislikeValue}.` });
      setShowDislikeSlider(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!chore) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Chore Not Found</h2>
        <p className="text-muted-foreground">The chore you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push('/chores')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chores
        </Button>
      </div>
    );
  }

  const userCanClaim = chore.status === 'Available' && currentUser;
  const userCanComplete = chore.status === 'In Progress' && chore.assignedTo === currentUser?.uid;
  const userHasSetDislike = currentUser && chore.dislikeValues?.[currentUser.uid] !== undefined;
  const isUrgent = chore.urgencyBonus && chore.urgencyBonus > 0 && chore.status !== 'Completed';


  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" onClick={() => router.push('/chores')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chores
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
             <CardTitle className="text-3xl">{chore.title}</CardTitle>
             {isUrgent && (
                <Badge variant="destructive" className="text-sm px-2 py-1">
                  <Zap className="mr-1 h-3 w-3" /> Urgent (+{chore.urgencyBonus} pts)
                </Badge>
              )}
            </div>
            <Badge variant={chore.status === 'Completed' ? 'default' : chore.status === 'In Progress' ? 'secondary' : 'outline'} className="text-sm px-3 py-1">
              {chore.status}
            </Badge>
          </div>
          {chore.description && <CardDescription className="text-base pt-2">{chore.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-3 text-md">
          <p><span className="font-semibold">Due Date:</span> {chore.dueDate ? new Date(chore.dueDate as string).toLocaleDateString() : 'N/A'}</p>
          <p><span className="font-semibold">Recurrence:</span> {chore.recurrence.charAt(0).toUpperCase() + chore.recurrence.slice(1)}</p>
          {chore.rewardPoints && chore.status === 'Completed' && (
            <p className="font-semibold text-primary"><span className="font-semibold">Points Awarded:</span> {chore.rewardPoints}</p>
          )}
          {chore.assignedTo && chore.status === 'In Progress' && (
             // In a real app, you would fetch the display name of the assigned user.
            <p><span className="font-semibold">Claimed by:</span> {chore.assignedTo === currentUser?.uid ? "You" : "Another member"}</p>
          )}
           {chore.completedBy && chore.status === 'Completed' && (
            <p><span className="font-semibold">Completed by:</span> {chore.completedBy === currentUser?.uid ? "You" : "Another member"}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6 border-t">
          {currentUser && chore.status !== 'Completed' && (
            <div className="w-full p-4 border rounded-md bg-background/50">
              {!userHasSetDislike && !showDislikeSlider && (
                <Button variant="outline" className="w-full" onClick={() => setShowDislikeSlider(true)}>
                  <ThumbsUp className="mr-2 h-4 w-4" /> Set Your Dislike Value
                </Button>
              )}
              {showDislikeSlider && (
                <div className="space-y-3">
                  <Label htmlFor={`dislike-${chore.id}`} className="text-md font-medium">Your Dislike Level: {dislikeValue}</Label>
                  <Slider
                    id={`dislike-${chore.id}`}
                    min={1} max={10} step={1}
                    defaultValue={[dislikeValue]}
                    onValueChange={(value) => setDislikeValue(value[0])}
                    className="my-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" onClick={handleSetDislike} disabled={actionLoading}>
                      {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Dislike
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowDislikeSlider(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {userHasSetDislike && !showDislikeSlider &&(
                <p className="text-md text-muted-foreground italic text-center">Your dislike value: {chore.dislikeValues[currentUser.uid]}</p>
              )}
            </div>
          )}
          
          <div className="flex w-full gap-3">
            {userCanClaim && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1 text-lg py-6" disabled={actionLoading || !userHasSetDislike}>
                    <Sparkles className="mr-2 h-5 w-5" /> Claim Chore
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Claim Chore: {chore.title}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will assign the chore to you.
                      {!userHasSetDislike && " You must set your dislike value first."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClaimChore} disabled={!userHasSetDislike}>
                      Confirm Claim
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {userCanComplete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1 text-lg py-6 bg-green-500 hover:bg-green-600 text-white" disabled={actionLoading}>
                    Mark as Complete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Complete Chore: {chore.title}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Confirming will award you points based on others' dislike values for this chore.
                      {chore.urgencyBonus && chore.urgencyBonus > 0 ? ` An additional ${chore.urgencyBonus} points will be awarded for urgent completion.` : ''}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCompleteChore} className="bg-green-500 hover:bg-green-600">
                      Confirm Completion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
