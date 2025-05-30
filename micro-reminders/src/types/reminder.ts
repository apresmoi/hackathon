export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:MM format
  frequency: "Once" | "Daily" | "Weekdays" | "Weekends" | "Weekly" | "Custom";
  icon?: string; // Lucide icon name
  createdAt: string; // ISO date string
  nextNotificationAt?: string; // ISO date string for next push
  completed: boolean;
  xpValue: number;
}

// Used for form handling, id is optional for new reminders
export type ReminderInput = Omit<Reminder, "id" | "createdAt" | "nextNotificationAt" | "completed" | "xpValue"> & {
  id?: string;
  action?: 'complete' | 'snooze'; // For PUT requests to specify action
};

export interface CompletionDetails {
  xpEarned: {
    base: number;
    quickBonus: number;
    streakBonus: number;
    total: number;
  };
  newStreak: number;
  bonusMessage: string;
}

// For API response when updating a reminder (especially complete/snooze)
export interface UpdatedReminderResponse {
  reminder: Reminder;
  completionDetails?: CompletionDetails;
}
