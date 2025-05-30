
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/auth-provider';
import { useFirebase } from '@/components/providers/firebase-provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const choreFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  recurrence: z.enum(['one-time', 'daily', 'weekly']),
  dueDate: z.date().optional(),
});

type ChoreFormValues = z.infer<typeof choreFormSchema>;

const URGENCY_BONUS_POINTS = 5;
const URGENCY_THRESHOLD_HOURS = 48;

export default function NewChorePage() {
  const { userProfile, isAdmin, currentUser, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChoreFormValues>({
    resolver: zodResolver(choreFormSchema),
    defaultValues: {
      title: '',
      description: '',
      recurrence: 'one-time',
    },
  });

  const onSubmit: SubmitHandler<ChoreFormValues> = async (data) => {
    setIsLoading(true);

    let urgencyBonus = 0;
    if (data.dueDate) {
      const now = new Date();
      const dueDate = new Date(data.dueDate);
      const hoursDifference = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDifference > 0 && hoursDifference <= URGENCY_THRESHOLD_HOURS) {
        urgencyBonus = URGENCY_BONUS_POINTS;
      }
    }

    // Handle mock user scenario first
    if (currentUser?.uid === 'mock-user-uid-123') {
      console.log("NewChorePage: Mocking chore creation for user:", currentUser.displayName);
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({ title: 'Chore Created (Mocked)!', description: `${data.title} has been "added".${urgencyBonus > 0 ? ` (+${urgencyBonus} bonus points for urgency!)` : ''}` });
      router.push('/chores');
      setIsLoading(false);
      return;
    }

    // Real Firebase logic
    if (!db || !userProfile?.familyId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database or family information is missing for chore creation.' });
      setIsLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'chores'), {
        ...data,
        familyId: userProfile.familyId,
        status: 'Available',
        dislikeValues: {}, // Initialize empty dislike values
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        urgencyBonus: urgencyBonus,
      });
      toast({ title: 'Chore Created!', description: `${data.title} has been added.${urgencyBonus > 0 ? ` (+${urgencyBonus} bonus points for urgency!)` : ''}` });
      router.push('/chores');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create chore.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    // Redirect if not admin
    // This check happens after authLoading is false, ensuring isAdmin has its correct value from AuthProvider
    if (typeof window !== 'undefined') {
        // Using setTimeout to ensure the redirect happens after the current render cycle
        // and to avoid potential issues with Next.js router during rendering.
        setTimeout(() => router.replace('/dashboard'), 0);
    }
    return <div className="flex justify-center items-center h-64"><p>Redirecting...</p><Loader2 className="h-8 w-8 animate-spin text-primary ml-2" /></div>;
  }


  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Chore</CardTitle>
          <CardDescription>Fill in the details for the new chore. Chores due within {URGENCY_THRESHOLD_HOURS} hours get +{URGENCY_BONUS_POINTS} bonus points!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wash the dishes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any specific instructions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Chore'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
