import { z } from 'zod';
import { DEFAULT_REMINDER_ICON } from './db';
import type { ReminderInput } from '@/types/reminder';

export const reminderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title must be at most 100 characters."),
  description: z.string().max(500, "Description must be at most 500 characters.").optional().or(z.literal("")),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM."),
  frequency: z.enum(["Once", "Daily", "Weekdays", "Weekends", "Weekly", "Custom"] as const),
  icon: z.string().min(1, "Icon name cannot be empty if provided.").max(50, "Icon name too long.").optional().or(z.literal("")),
}) satisfies z.ZodType<Omit<ReminderInput, 'id' | 'action'>>;

export type ReminderFormData = z.infer<typeof reminderSchema>;
