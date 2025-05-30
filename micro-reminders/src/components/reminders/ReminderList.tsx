"use client";

import type { Reminder } from '@/types/reminder';
import { ReminderCard } from './ReminderCard';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, PlusCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { suggestReminderTime } from '@/ai/flows/suggest-reminder-time';
import { suggestReminderIcon } from '@/ai/flows/suggest-reminder-icon';
import { suggestReminderFrequency } from '@/ai/flows/suggest-reminder-frequency';

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onAddNew: (suggestions?: { 
    title?: string;
    description?: string;
    time?: string; 
    icon?: string;
    frequency?: string;
  }) => void;
  onComplete: (reminderId: string) => void;
  onSnooze: (reminderId: string) => void;
  isCompleting: boolean;
  isSnoozing: boolean;
}

export function ReminderList({ 
  reminders, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onAddNew,
  onComplete,
  onSnooze,
  isCompleting,
  isSnoozing
}: ReminderListProps) {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAICreate = async () => {
    if (!aiInput.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a description for your reminder." });
      return;
    }

    setIsProcessing(true);
    try {
      // Get complete reminder suggestion from AI
      const timeResult = await suggestReminderTime({ description: aiInput });
      const iconResult = await suggestReminderIcon({ 
        title: aiInput.split(' ').slice(0, 3).join(' '), 
        description: aiInput 
      });
      const frequencyResult = await suggestReminderFrequency({
        title: aiInput.split(' ').slice(0, 3).join(' '),
        description: aiInput,
        time: timeResult.suggestedTime
      });
      
      // Open the form with AI suggestions
      onAddNew({
        title: aiInput.split(' ').slice(0, 5).join(' '), // Use first 5 words as title
        description: aiInput,
        time: timeResult.suggestedTime,
        icon: iconResult.suggestedIconName,
        frequency: frequencyResult.suggestedFrequency
      });
      setIsAIDialogOpen(false);
      setAiInput('');
      
      // Show success toast with AI suggestions
      toast({ 
        title: "AI Suggestions Ready", 
        description: `Time: ${timeResult.suggestedTime}, Icon: ${iconResult.suggestedIconName}, Frequency: ${frequencyResult.suggestedFrequency}` 
      });
    } catch (error) {
      console.error("Error creating reminder with AI:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create reminder with AI." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg text-destructive">Error loading reminders: {error.message}</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image 
          src="https://placehold.co/300x200.png" 
          alt="No reminders illustration" 
          width={300} 
          height={200}
          className="opacity-70 rounded-lg shadow-md"
          data-ai-hint="empty state checklist"
        />
        <h3 className="mt-8 text-2xl font-semibold text-foreground">No Reminders Yet!</h3>
        <p className="mt-2 text-muted-foreground">Looks like your schedule is clear. Add a new reminder to get started.</p>
        <div className="flex gap-2 mt-6">
          <Button onClick={() => setIsAIDialogOpen(true)} variant="outline">
            <Sparkles className="mr-2 h-4 w-4 text-accent" /> AI Create
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setIsAIDialogOpen(true)} variant="outline">
            <Sparkles className="mr-2 h-4 w-4 text-accent" /> AI Create
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reminders.map((reminder) => (
          <ReminderCard 
            key={reminder.id} 
            reminder={reminder} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onComplete={onComplete}
            onSnooze={onSnooze}
            isCompleting={isCompleting}
            isSnoozing={isSnoozing}
          />
        ))}
      </div>

      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reminder with AI</DialogTitle>
            <DialogDescription>
              Describe what you want to be reminded about, and AI will help create it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="e.g., Remind me to take my medicine every day at 8 PM"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              disabled={isProcessing}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAIDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleAICreate} disabled={isProcessing || !aiInput.trim()}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
