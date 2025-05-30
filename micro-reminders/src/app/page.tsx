"use client";

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ReminderList } from '@/components/reminders/ReminderList';
import { ReminderForm } from '@/components/reminders/ReminderForm';
import type { Reminder, ReminderInput, UpdatedReminderResponse } from '@/types/reminder';
import { Header } from '@/components/layout/Header';
import { PlusCircle, BellRing, BellOff, Loader2 } from 'lucide-react';
import { subscribeUserToPush, unsubscribeUserFromPush } from '@/utils/webPush';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationDialog } from '@/components/reminders/DeleteConfirmationDialog';

async function fetchReminders(): Promise<Reminder[]> {
  const res = await fetch('/api/reminders');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
}

async function addReminder(newReminder: ReminderInput): Promise<Reminder> {
  const { action, ...reminderData } = newReminder;
  const res = await fetch('/api/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to add reminder' }));
    throw new Error(errorData.message || 'Failed to add reminder');
  }
  return res.json();
}

// Returns the updated reminder object from the response
async function updateReminder(updatedReminder: ReminderInput): Promise<Reminder> {
  if (!updatedReminder.id) throw new Error("Reminder ID is required for update.");
  const { action, ...reminderData } = updatedReminder;
  const res = await fetch(`/api/reminders/${updatedReminder.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to update reminder' }));
    throw new Error(errorData.message || 'Failed to update reminder');
  }
  const responseData: UpdatedReminderResponse = await res.json();
  return responseData.reminder; // Return only the reminder part for general updates
}

async function deleteReminder(reminderId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/reminders/${reminderId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to delete reminder' }));
    throw new Error(errorData.message || 'Failed to delete reminder');
  }
  return res.json();
}

// These action functions now return the full UpdatedReminderResponse
async function completeReminderAction(reminderId: string): Promise<UpdatedReminderResponse> {
  const res = await fetch(`/api/reminders/${reminderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'complete' }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to complete reminder' }));
    throw new Error(errorData.message || 'Failed to complete reminder');
  }
  return res.json();
}

async function snoozeReminderAction(reminderId: string): Promise<UpdatedReminderResponse> {
  const res = await fetch(`/api/reminders/${reminderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'snooze' }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to snooze reminder' }));
    throw new Error(errorData.message || 'Failed to snooze reminder');
  }
  return res.json();
}


export default function HomePage(): ReactElement {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{ 
    title?: string;
    description?: string;
    time?: string; 
    icon?: string;
  }>({});


  useEffect(() => {
    const checkSubscription = async () => {
      setIsSubscriptionLoading(true);
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsPushSubscribed(!!subscription);
        } catch (error) {
          console.error("Error checking push subscription:", error);
          setIsPushSubscribed(false);
        }
      } else {
        setIsPushSubscribed(false); 
      }
      setIsSubscriptionLoading(false);
    };
    checkSubscription();
  }, []);

  const { data: reminders = [], isLoading, error } = useQuery<Reminder[], Error>({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
  });

  const baseMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['userXP'] });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Operation Failed", description: err.message });
    },
  };

  const addMutation = useMutation({ 
    mutationFn: addReminder, 
    ...baseMutationOptions,
    onSuccess: (data) => {
      baseMutationOptions.onSuccess();
      toast({ title: "Reminder Created", description: `"${data.title}" has been saved.`});
    }
  });
  
  const updateMutation = useMutation({ 
    mutationFn: updateReminder, 
    ...baseMutationOptions,
    onSuccess: (data) => {
      baseMutationOptions.onSuccess();
      toast({ title: "Reminder Updated", description: `"${data.title}" has been saved.`});
    }
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: deleteReminder,
    onSuccess: () => {
      baseMutationOptions.onSuccess();
      toast({ title: "Reminder Deleted", description: `"${reminderToDelete?.title}" has been removed.` });
      closeDeleteConfirmation();
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
      closeDeleteConfirmation();
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeReminderAction,
    onSuccess: (data: UpdatedReminderResponse) => {
      baseMutationOptions.onSuccess();
      const message = data.completionDetails?.bonusMessage || `"${data.reminder.title}" marked as complete. You gained ${data.reminder.xpValue} XP!`;
      toast({ title: "Reminder Completed!", description: message });
    },
    onError: baseMutationOptions.onError,
  });

  const snoozeMutation = useMutation({
    mutationFn: snoozeReminderAction,
    onSuccess: (data: UpdatedReminderResponse) => {
      baseMutationOptions.onSuccess();
      const message = data.completionDetails?.bonusMessage || `"${data.reminder.title}" snoozed.`;
      toast({ title: "Reminder Snoozed", description: message, variant: "default" });
    },
    onError: baseMutationOptions.onError,
  });


  const handleFormSubmit = async (data: ReminderInput) => {
    if (editingReminder) {
      await updateMutation.mutateAsync({ ...data, id: editingReminder.id });
    } else {
      await addMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (reminderToDelete) {
      deleteMutation.mutate(reminderToDelete.id);
    }
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(false);
    setReminderToDelete(null);
  };

  const handleToggleSubscription = async () => {
    setIsSubscriptionLoading(true);
    if (isPushSubscribed) {
      const success = await unsubscribeUserFromPush();
      if (success) {
        setIsPushSubscribed(false);
        toast({ title: 'Unsubscribed', description: 'You will no longer receive push notifications.' });
      } else {
        toast({ variant: 'destructive', title: 'Unsubscription Failed', description: 'Could not unsubscribe from push notifications.' });
      }
    } else {
      const subscription = await subscribeUserToPush();
      if (subscription) {
        setIsPushSubscribed(true);
        toast({ 
          title: 'Subscribed!', 
          description: 'You will now receive push notifications for your reminders. You can test it by creating a reminder.' 
        });
        try {
          await fetch('/api/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (apiError) {
          console.error("Failed to send subscription to backend:", apiError);
          toast({ 
            variant: 'destructive', 
            title: 'Subscription Warning', 
            description: 'You are subscribed but there was an error saving your preferences. Notifications may not work properly.' 
          });
        }
      }
    }
    setIsSubscriptionLoading(false);
  };
  
  const isActionLoading = addMutation.isPending || updateMutation.isPending || completeMutation.isPending || snoozeMutation.isPending;


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-foreground">Your Reminders</h1>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              onClick={handleToggleSubscription}
              disabled={isSubscriptionLoading}
              variant="outline"
              className="w-full sm:w-auto text-sm"
            >
              {isSubscriptionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isPushSubscribed ? (
                <BellOff className="mr-2 h-4 w-4" />
              ) : (
                <BellRing className="mr-2 h-4 w-4" />
              )}
              {isSubscriptionLoading ? 'Loading...' : isPushSubscribed ? 'Unsubscribe' : 'Enable Notifications'}
            </Button>
            <Button
              onClick={() => { setEditingReminder(null); setAiSuggestions({}); setIsFormOpen(true); }}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              aria-label="Add new reminder"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Reminder
            </Button>
          </div>
        </div>

        <ReminderList
          reminders={reminders}
          isLoading={isLoading || isActionLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={(id) => {
            const reminder = reminders.find(r => r.id === id);
            if (reminder) handleDeleteRequest(reminder);
          }}
          onAddNew={(suggestions) => { 
            setEditingReminder(null); 
            setAiSuggestions(suggestions || {}); 
            setIsFormOpen(true); 
          }}
          onComplete={(id) => completeMutation.mutate(id)}
          onSnooze={(id) => snoozeMutation.mutate(id)}
          isCompleting={completeMutation.isPending}
          isSnoozing={snoozeMutation.isPending}
        />
      </main>

      <ReminderForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingReminder(null); setAiSuggestions({}); }}
        onSubmit={handleFormSubmit}
        initialData={editingReminder}
        aiSuggestions={aiSuggestions}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        reminderTitle={reminderToDelete?.title}
        isDeleting={deleteMutation.isPending}
      />

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} MicroReminder. Focus on what matters.
      </footer>
    </div>
  );
}
