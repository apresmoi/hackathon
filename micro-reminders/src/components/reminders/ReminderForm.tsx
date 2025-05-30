"use client";

import type * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Reminder, ReminderInput } from '@/types/reminder';
import { reminderSchema, type ReminderFormData } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { suggestReminderTime } from '@/ai/flows/suggest-reminder-time';
import { suggestReminderIcon } from '@/ai/flows/suggest-reminder-icon';
import { DEFAULT_REMINDER_ICON } from '@/lib/db';
import { LucideIconRenderer } from '@/components/icons/LucideIconRenderer';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReminderInput) => void;
  initialData?: Reminder | null;
  aiSuggestions?: {
    title?: string;
    description?: string;
    time?: string;
    icon?: string;
  };
}

export function ReminderForm({ isOpen, onClose, onSubmit, initialData, aiSuggestions }: ReminderFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingTime, setIsSuggestingTime] = useState(false);
  const [isSuggestingDetails, setIsSuggestingDetails] = useState(false);

  const form = useForm<ReminderInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: initialData?.title || aiSuggestions?.title || '',
      description: initialData?.description || aiSuggestions?.description || '',
      time: initialData?.time || aiSuggestions?.time || '09:00',
      icon: initialData?.icon || aiSuggestions?.icon || 'bell',
      frequency: initialData?.frequency || 'Once',
    },
  });

  // Reset form when initialData or aiSuggestions change
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: initialData?.title || aiSuggestions?.title || '',
        description: initialData?.description || aiSuggestions?.description || '',
        time: initialData?.time || aiSuggestions?.time || '09:00',
        icon: initialData?.icon || aiSuggestions?.icon || 'bell',
        frequency: initialData?.frequency || 'Once',
      });
    }
  }, [isOpen, initialData, aiSuggestions, form]);

  const handleFormSubmit = async (data: ReminderInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: initialData?.id,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save reminder. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestTime = async () => {
    const description = form.getValues("description");
    if (!description || description.trim().length < 3) {
      toast({ variant: "default", title: "Description Needed", description: "Please provide a description to suggest a time." });
      return;
    }

    setIsSuggestingTime(true);
    try {
      const suggestion = await suggestReminderTime({ description });
      form.setValue("time", suggestion.suggestedTime, { shouldValidate: true });
      toast({ title: "AI Suggestions Applied", description: `Time: ${suggestion.suggestedTime} (${suggestion.reasoning})` });
    } catch (error) {
      console.error("Error suggesting time:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to get AI suggestions." });
    } finally {
      setIsSuggestingTime(false);
    }
  };

  const handleSuggestDetails = async (suggestTime: boolean, suggestIcon: boolean) => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    let timeSuggested = false;
    let iconSuggested = false;

    setIsSuggestingDetails(true);
    try {
      if (suggestTime) {
        if (!description || description.trim().length < 3) {
          toast({ variant: "default", title: "Description Needed for Time", description: "Provide a description to suggest a time." });
        } else {
          const timeResult = await suggestReminderTime({ description });
          if (timeResult.suggestedTime) {
            form.setValue("time", timeResult.suggestedTime, { shouldValidate: true });
            toast({ title: "Time Suggested", description: `${timeResult.suggestedTime} (Reason: ${timeResult.reasoning})`});
            timeSuggested = true;
          } else {
            toast({ variant: "default", title: "Time Suggestion Not Clear", description: "Could not confidently suggest a time."});
          }
        }
      }

      if (suggestIcon) {
        if (!title || title.trim().length < 3) {
          toast({ variant: "default", title: "Title Needed for Icon", description: "Please provide a title to suggest an icon." });
        } else {
          const iconResult = await suggestReminderIcon({ 
            title, 
            description: description || '' 
          });
          if (iconResult.suggestedIconName) {
            form.setValue("icon", iconResult.suggestedIconName, { shouldValidate: true });
            toast({ title: "Icon Suggested", description: `${iconResult.suggestedIconName} (Reason: ${iconResult.reasoning})`});
            iconSuggested = true;
          } else {
            toast({ variant: "default", title: "Icon Suggestion Not Clear", description: "Could not confidently suggest an icon. Defaulting."});
            form.setValue("icon", DEFAULT_REMINDER_ICON, { shouldValidate: true });
          }
        }
      }

      if (!timeSuggested && !iconSuggested && (suggestTime || suggestIcon)) {
        // If attempts were made but nothing was suggested
        // Individual toasts for lack of info would have already fired.
      }

    } catch (error) {
      console.error("Error suggesting details:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to get AI suggestions."});
    } finally {
      setIsSuggestingDetails(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Modify details or let AI help suggest time and icon.' : 'Set up a new reminder. AI can help with time and icon!'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Hydration" {...field} aria-describedby="title-error" />
                  </FormControl>
                  <FormMessage id="title-error" />
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
                    <Textarea placeholder="e.g., Drink a full glass of water" {...field} aria-describedby="description-error" />
                  </FormControl>
                  <FormMessage id="description-error" />
                </FormItem>
              )}
            />

            <div className="space-y-2 rounded-md border border-dashed p-3">
              <Label className="text-xs font-medium text-muted-foreground">AI Assistance</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestTime} disabled={isSuggestingTime || isSubmitting}>
                  {isSuggestingTime ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4 text-accent" />} Suggest Time
                </Button>
              </div>
              <FormDescription className="text-xs">
                AI will suggest a time based on your reminder description.
              </FormDescription>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} aria-describedby="time-error" className="w-full" />
                    </FormControl>
                    <FormMessage id="time-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="frequency-error">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Once">Once</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekdays">Weekdays (Mon-Fri)</SelectItem>
                        <SelectItem value="Weekends">Weekends (Sat-Sun)</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Custom">Custom (Not active)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage id="frequency-error" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {['Coffee', 'BookOpen', 'ClipboardList', 'Calendar', 'Bell', 'CheckCircle', 'Clock', 'Star'].map((iconName) => (
                        <Button
                          key={iconName}
                          type="button"
                          variant={field.value === iconName ? "default" : "outline"}
                          size="sm"
                          className="h-10 w-full"
                          onClick={() => form.setValue("icon", iconName)}
                        >
                          <LucideIconRenderer name={iconName} className="h-5 w-5" />
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select an icon for your reminder
                  </FormDescription>
                  <FormMessage id="icon-error" />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isSuggestingTime || isSuggestingDetails} className="bg-accent hover:bg-accent/90">
                {(isSubmitting || isSuggestingTime || isSuggestingDetails) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Save Changes' : 'Create Reminder'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
