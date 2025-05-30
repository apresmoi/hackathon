
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useFirebase } from '@/components/providers/firebase-provider';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Gift, Star, Loader2, Coins } from 'lucide-react';
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

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: React.ElementType;
}

const availableRewards: Reward[] = [
  { id: 'reward1', title: 'Extra 30 Mins Screen Time', description: 'Enjoy an additional 30 minutes on your favorite device.', cost: 30, icon: Coins },
  { id: 'reward2', title: '1 Hour Video Game Time', description: 'Uninterrupted hour of gaming fun!', cost: 50, icon: Coins },
  { id: 'reward3', title: 'Pick the Movie Night Film', description: 'You get to choose what everyone watches.', cost: 60, icon: Coins },
  { id: 'reward4', title: 'Skip One Minor Chore', description: 'Get a pass on one of your smaller chores (admin approval may be needed).', cost: 75, icon: Coins },
  { id: 'reward5', title: 'Choose Dinner for a Night', description: 'Decide what the family eats for one meal.', cost: 100, icon: Coins },
  { id: 'reward6', title: 'Small Toy or Treat (Under $5)', description: 'Redeem for a small pre-approved item.', cost: 120, icon: Gift },
  { id: 'reward7', title: 'Allowance Boost ($5)', description: 'Add $5 to your next allowance payout.', cost: 150, icon: Star },
];

export default function RedeemPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [currentPoints, setCurrentPoints] = useState(userProfile?.points || 0);
  const [isLoading, setIsLoading] = useState(false); // For redemption action

  useEffect(() => {
    if (userProfile) {
      setCurrentPoints(userProfile.points || 0);
    }
  }, [userProfile]);

  const handleRedeemReward = async (reward: Reward) => {
    if (!currentUser || !userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to redeem rewards.' });
      return;
    }

    if (currentPoints < reward.cost) {
      toast({ variant: 'destructive', title: 'Not enough points', description: `You need ${reward.cost - currentPoints} more points for this reward.` });
      return;
    }

    setIsLoading(true);

    const newPoints = currentPoints - reward.cost;

    // Mock user handling
    if (currentUser.uid === 'mock-user-uid-123') {
      setCurrentPoints(newPoints); // Update local state for visual feedback
      // Note: This won't persist for the AuthProvider's mock user across page loads.
      // A more robust mock would involve updating AuthProvider's state if possible,
      // or just accept this local visual update.
      console.log(`MOCK: Redeemed ${reward.title} for ${reward.cost} points. New mock balance: ${newPoints}`);
      toast({ title: 'Reward Redeemed (Mocked)!', description: `You "redeemed" ${reward.title}. Your new balance is ${newPoints} points.` });
      setIsLoading(false);
      // Potentially update the mock user profile in AuthProvider if a mechanism exists
      // For now, we'll rely on the user seeing the local update.
      // auth.updateMockUserProfile({ ...userProfile, points: newPoints }); // Fictional function
      return;
    }

    // Real user handling
    if (!db) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database service not available.' });
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);

    try {
      await updateDoc(userDocRef, {
        points: newPoints,
        // Optionally, log this redemption as an activity
        // lastRedemption: { rewardId: reward.id, rewardTitle: reward.title, cost: reward.cost, date: serverTimestamp() }
      });
      setCurrentPoints(newPoints); // Update local state, AuthProvider will also update via its listener eventually
      toast({ title: 'Reward Redeemed!', description: `You redeemed ${reward.title}. You have ${newPoints} points left.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Redemption Failed', description: error.message || 'Could not update points.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Redeem Points</h1>
        <p className="text-muted-foreground">Use your hard-earned points to get awesome rewards!</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Star className="mr-3 h-7 w-7 text-accent" /> Your Points Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-primary">{currentPoints}</p>
          <p className="text-muted-foreground mt-1">Keep up the great work to earn more!</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Available Rewards</h2>
        {availableRewards.length === 0 && (
          <p className="text-muted-foreground">No rewards available at the moment. Check back soon!</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <reward.icon className="h-8 w-8 text-primary mr-3" />
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                </div>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-2xl font-semibold text-accent">{reward.cost} <span className="text-sm text-muted-foreground">points</span></p>
              </CardContent>
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={isLoading || currentPoints < reward.cost}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Redeem
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Redeem "{reward.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cost {reward.cost} points. Are you sure you want to redeem this reward?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleRedeemReward(reward)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Redemption'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
