
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // Added import here
import { useAuth } from '@/components/providers/auth-provider';
import { useFirebase } from '@/components/providers/firebase-provider';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, writeBatch, serverTimestamp, getDoc, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Family } from '@/lib/types';
import { Loader2, UserPlus, Trash2, Crown } from 'lucide-react';
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
import { sendInviteEmail } from '@/ai/flows/send-invite-email-flow';


const addMemberFormSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type AddMemberFormValues = z.infer<typeof addMemberFormSchema>;

export default function FamilyPage() {
  const { userProfile, isAdmin, currentUser } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (!isAdmin && typeof window !== 'undefined' && !isLoading) { // Added !isLoading to prevent premature redirect
      router.replace('/dashboard');
      return;
    }

    const fetchFamilyData = async () => {
      if (!userProfile?.familyId) {
        setIsLoading(false);
        // toast({ variant: 'destructive', title: 'Error', description: 'User profile or family ID is missing for fetching family data.' });
        return;
      }
      setIsLoading(true);

      // Handle mock user scenario
      if (currentUser?.uid === 'mock-user-uid-123' && userProfile.familyId === 'mock-family-id-xyz') {
        console.log("FamilyPage: Using mock family data for mock admin.");
        const mockFamily: Family = {
          id: 'mock-family-id-xyz',
          name: 'The Mock Household',
          adminUids: ['mock-user-uid-123'],
          memberUids: ['mock-user-uid-123'],
        };
        setFamilyData(mockFamily);
        
        // Ensure the mock admin itself is listed as a member if not already
        // userProfile from AuthContext is the authoritative mock admin profile
        if (userProfile) {
            setFamilyMembers([userProfile]);
        } else {
             // Fallback, though userProfile should always exist for mock admin
            setFamilyMembers([{
                uid: 'mock-user-uid-123', email: 'mockuser@example.com', displayName: 'Mock Admin',
                familyId: 'mock-family-id-xyz', isAdmin: true, points: 0
            }]);
        }
        setIsLoading(false);
        return;
      }

      // Proceed with fetching real data if not mock user
      if (!db) {
        toast({ variant: 'destructive', title: 'Database Error', description: 'Database service is not available for family data.' });
        setIsLoading(false);
        return;
      }

      try {
        // Fetch family document
        const familyDocRef = doc(db, 'families', userProfile.familyId);
        const familyDocSnap = await getDoc(familyDocRef);
        if (familyDocSnap.exists()) {
          setFamilyData({ id: familyDocSnap.id, ...familyDocSnap.data() } as Family);
        } else {
          toast({ variant: 'destructive', title: 'Data Not Found', description: 'Family data could not be located.' });
          setFamilyData(null);
        }

        // Fetch family members
        const membersQuery = query(collection(db, 'users'), where('familyId', '==', userProfile.familyId));
        const querySnapshot = await getDocs(membersQuery);
        const members = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
        setFamilyMembers(members);
      } catch (error: any) {
        console.error("Error fetching family data:", error);
        toast({ variant: 'destructive', title: 'Fetch Error', description: `Could not fetch family data: ${error.message}` });
        setFamilyData(null); 
        setFamilyMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userProfile) { // Ensure userProfile is loaded before trying to fetch
        fetchFamilyData();
    } else if (!isLoading) { // If not loading and no userProfile, it's an issue or logout
        setIsLoading(false); 
    }


  }, [db, userProfile, isAdmin, router, toast, currentUser, isLoading]); // Added currentUser and isLoading

  const onSubmit: SubmitHandler<AddMemberFormValues> = async (data) => {
    if (!currentUser?.displayName || !userProfile?.familyId) {
      toast({ variant: 'destructive', title: 'User Error', description: 'Current user or family information is missing.' });
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Handle mock user scenario explicitly
      if (currentUser.uid === 'mock-user-uid-123') {
        if (!familyData) { // Should be set by useEffect for mock user
            toast({ variant: 'destructive', title: 'Mock Setup Error', description: 'Mock family data is not available. Please refresh.' });
            setIsSubmitting(false);
            return;
        }
        // Simulate: decide if user is "new" or "existing" for mock purposes
        // For predictability, let's use a specific email pattern for new invites in mock mode
        const isNewInvite = data.email.startsWith('newmock') || data.email.startsWith('invite');

        if (isNewInvite) {
          const inviteResult = await sendInviteEmail({
            email: data.email,
            familyName: familyData.name, // Mock familyData.name used here
            adminName: currentUser.displayName,
          });
          toast({ title: 'Invitation Sent (Simulated)', description: inviteResult.message });
        } else {
          // Simulate adding an "existing" user (who is not yet in a family)
          const mockInvitedUser: UserProfile = {
            uid: `mock-invited-${Date.now()}`, // Generate a unique mock UID
            email: data.email,
            displayName: data.email.split('@')[0] || 'Mock Invited Member',
            familyId: null, // Not in a family yet
            isAdmin: false,
            points: 0,
          };
          // Simulate adding to local state
          setFamilyMembers(prev => [...prev, { ...mockInvitedUser, familyId: userProfile.familyId, isAdmin: false }]);
          setFamilyData(prev => prev ? ({ ...prev, memberUids: [...prev.memberUids, mockInvitedUser.uid] }) : null);
          toast({ title: 'Member Added (Mocked)', description: `${mockInvitedUser.displayName} has been "added" to your family.` });
        }
        form.reset();
        setIsSubmitting(false);
        return;
      }

      // ---- Real Firebase Logic ----
      if (!db || !familyData) { // Check db and familyData for real operations
        toast({ variant: 'destructive', title: 'System Error', description: 'Database or family data is not available for this operation.' });
        setIsSubmitting(false);
        return;
      }
      
      const userQuery = query(collection(db, 'users'), where('email', '==', data.email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        const inviteResult = await sendInviteEmail({
          email: data.email,
          familyName: familyData.name,
          adminName: currentUser.displayName,
        });
        if (inviteResult.success) {
          toast({ title: 'Invitation Sent', description: inviteResult.message });
        } else {
          toast({ variant: 'destructive', title: 'Invitation Failed', description: inviteResult.message });
        }
        form.reset();
      } else {
        const invitedUserDoc = userSnapshot.docs[0];
        const invitedUserData = invitedUserDoc.data() as UserProfile;

        if (invitedUserData.familyId) {
           toast({ variant: 'destructive', title: 'User Occupied', description: `${invitedUserData.displayName || data.email} is already part of a family.` });
           setIsSubmitting(false);
           return;
        }
        
        const batch = writeBatch(db);
        const familyDocRef = doc(db, 'families', userProfile.familyId); // familyId from admin's profile
        const invitedUserRef = doc(db, 'users', invitedUserDoc.id);

        batch.update(familyDocRef, { memberUids: arrayUnion(invitedUserDoc.id) });
        batch.update(invitedUserRef, { familyId: userProfile.familyId, isAdmin: false });

        await batch.commit();
        
        setFamilyMembers(prev => [...prev, { ...invitedUserData, uid: invitedUserDoc.id, familyId: userProfile.familyId, isAdmin: false }]);
        setFamilyData(prev => prev ? ({...prev, memberUids: arrayUnion(invitedUserDoc.id) as unknown as string[] }) : null );

        toast({ title: 'Member Added', description: `${invitedUserData.displayName || data.email} has been added to your family.` });
        form.reset();
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Operation Failed', description: `Error adding member: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveMember = async (memberUid: string) => {
    if (!db || !userProfile?.familyId || !familyData || memberUid === currentUser?.uid) {
      toast({ variant: 'destructive', title: 'Cannot remove member', description: 'Admins cannot remove themselves or an error occurred.' });
      return;
    }
    
    const memberToRemove = familyMembers.find(m => m.uid === memberUid);
    if (!memberToRemove) {
      toast({ variant: 'destructive', title: 'Error', description: 'Member not found in current list.' });
      return;
    }

    if (currentUser?.uid === 'mock-user-uid-123') {
        console.log("FamilyPage: Mocking remove member.");
        setFamilyMembers(prev => prev.filter(m => m.uid !== memberUid));
        if (familyData) {
            setFamilyData(prev => prev ? ({
                ...prev,
                memberUids: prev.memberUids.filter(uid => uid !== memberUid),
                adminUids: prev.adminUids.filter(uid => uid !== memberUid) 
            }) : null);
        }
        toast({ title: 'Member Removed (Mocked)', description: `${memberToRemove.displayName || 'Member'} has been "removed".` });
        return;
    }


    if (memberToRemove.isAdmin) {
        const otherAdmins = familyMembers.filter(m => m.isAdmin && m.uid !== memberUid);
        if (otherAdmins.length === 0 && familyData.adminUids.length <=1 && familyData.adminUids.includes(memberUid)) {
             toast({ variant: 'destructive', title: 'Cannot remove last admin', description: 'A family must have at least one admin.' });
             return;
        }
    }


    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const familyDocRef = doc(db, 'families', userProfile.familyId);
      const memberUserRef = doc(db, 'users', memberUid);

      batch.update(familyDocRef, { 
        memberUids: arrayRemove(memberUid),
        adminUids: arrayRemove(memberUid) 
      });
      batch.update(memberUserRef, { familyId: null, isAdmin: false }); 

      await batch.commit();

      setFamilyMembers(prev => prev.filter(m => m.uid !== memberUid));
      if (familyData) {
        setFamilyData(prev => prev ? ({...prev, memberUids: prev.memberUids.filter(uid => uid !== memberUid), adminUids: prev.adminUids.filter(uid => uid !== memberUid)}) : null);
      }
      toast({ title: 'Member Removed', description: `${memberToRemove.displayName || 'Member'} has been removed from the family.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error removing member', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading && !familyData && !(currentUser?.uid === 'mock-user-uid-123')) { // Show loader if actually loading real data
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!isAdmin && typeof window !== 'undefined' && !isLoading) { 
      setTimeout(() => router.replace('/dashboard'), 0);
      return <div className="flex justify-center items-center h-64"><p>Redirecting...</p><Loader2 className="h-8 w-8 animate-spin text-primary ml-2" /></div>;
  }
  // This check is for non-mock admins; mock admin always has mock-family-id-xyz
  if (!userProfile?.familyId && isAdmin && currentUser?.uid !== 'mock-user-uid-123') {
    return <p>Your user profile does not seem to be part of a family. Please contact support.</p>;
  }


  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Family Management</h1>
        <p className="text-muted-foreground">Manage members of {familyData?.name || (currentUser?.uid === 'mock-user-uid-123' ? 'The Mock Household' : 'your family')}.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Member</CardTitle>
          <CardDescription>Invite a user to your family by their email. If they don't have a ChoreCoin account, an invitation will be "sent" asking them to sign up first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="member@example.com or newmock@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Add / Invite Member
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Family Members ({familyMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyMembers.map((member) => (
                <TableRow key={member.uid}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${member.email || member.uid}.png?size=40`} data-ai-hint="user avatar" />
                      <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{member.displayName || 'N/A'}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {member.isAdmin ? (
                      <Badge variant="default" className="bg-primary hover:bg-primary/90">
                        <Crown className="mr-1 h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.uid !== currentUser?.uid && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm" disabled={isSubmitting || member.uid === 'mock-user-uid-123' && familyMembers.filter(m => m.isAdmin).length <= 1}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {member.displayName || 'this member'}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. {member.displayName || 'The member'} will be removed from the family.
                              {member.isAdmin && " Removing an admin might have significant consequences, especially if they are the last one."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveMember(member.uid)} 
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={isSubmitting || (member.isAdmin && familyData?.adminUids.includes(member.uid) && familyData.adminUids.length <= 1 && familyMembers.filter(m => m.isAdmin).length <= 1)}
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {familyMembers.length === 0 && isAdmin && ( 
            <p className="text-center text-muted-foreground py-4">No other members in this family yet. Add some!</p>
          )}
           {familyMembers.length === 0 && !isAdmin && ( 
            <p className="text-center text-muted-foreground py-4">Family member data could not be loaded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


    
