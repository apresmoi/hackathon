
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useFirebase } from '@/components/providers/firebase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const { auth, db } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) {
      // If Firebase services aren't even available (e.g. initial config completely missing)
      // Rely on AuthProvider to provide a mock user, just redirect.
      toast({ title: 'Signup Mocked (No Firebase Service)', description: `Welcome (mocked), ${displayName}!` });
      router.push('/dashboard');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      const batch = writeBatch(db);

      // Create family document
      const familyDocRef = doc(db, 'families', user.uid); // Using user UID as family ID for simplicity for now
      batch.set(familyDocRef, {
        id: user.uid,
        name: familyName,
        adminUids: [user.uid],
        memberUids: [user.uid],
        createdAt: serverTimestamp(),
      });
      
      // Create user profile document
      const userDocRef = doc(db, 'users', user.uid);
      batch.set(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        familyId: user.uid, // User's family ID is their own UID as they created it
        isAdmin: true,
        points: 0,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      toast({ title: 'Signup Successful', description: `Welcome to ChoreCoin, ${displayName}!` });
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/invalid-api-key') {
        // If API key is invalid, "pretend" signup worked and redirect.
        // AuthProvider will serve the mock user.
        toast({ title: 'Signup Mocked (Invalid API Key)', description: `Welcome (mocked), ${displayName}!` });
        router.push('/dashboard');
      } else {
        // Handle other errors normally
        setError(err.message || 'Failed to sign up. Please try again.');
        toast({ variant: 'destructive', title: 'Signup Failed', description: err.message || 'An error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserPlus className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold">Create your ChoreCoin Account</CardTitle>
        <CardDescription>Join your family and start managing chores.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="displayName">Your Name</Label>
            <Input id="displayName" type="text" placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="familyName">Family Name</Label>
            <Input id="familyName" type="text" placeholder="The Doe Family" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
