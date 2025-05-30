"use client";

import type { Reminder } from '@/types/reminder';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, Repeat, CheckCircle2, XCircle, AwardIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { LucideIconRenderer } from '@/components/icons/LucideIconRenderer';
import { DEFAULT_REMINDER_ICON } from '@/lib/db';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onComplete: (reminderId: string) => void;
  onSnooze: (reminderId: string) => void;
  isCompleting: boolean;
  isSnoozing: boolean;
}

export function ReminderCard({ reminder, onEdit, onDelete, onComplete, onSnooze, isCompleting, isSnoozing }: ReminderCardProps) {
  const formattedTime = reminder.time; 
  const createdAtDate = parseISO(reminder.createdAt);

  const cardClasses = cn(
    "w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col",
    reminder.completed && "bg-muted/50 opacity-70"
  );
  const titleClasses = cn(
    "text-lg font-semibold group-hover:text-primary transition-colors", // Adjusted title size
    reminder.completed && "line-through text-muted-foreground"
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 group flex-1 min-w-0">
            <LucideIconRenderer 
              name={reminder.icon || DEFAULT_REMINDER_ICON} 
              className={cn("h-6 w-6 shrink-0", reminder.completed ? "text-muted-foreground" : "text-primary")} 
            />
            <CardTitle className={cn(titleClasses, "truncate")} title={reminder.title}>{reminder.title}</CardTitle>
          </div>
          <Badge variant={reminder.frequency === 'Once' ? 'secondary' : 'default'} className="capitalize shrink-0">
            {reminder.frequency}
          </Badge>
        </div>
        {reminder.description && (
          <CardDescription className={cn("text-xs text-muted-foreground pt-1 truncate", reminder.completed && "line-through")}>
            {reminder.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5 flex-grow text-sm pb-4">
        <div className="flex items-center text-foreground">
          <Clock className="mr-2 h-4 w-4 text-accent" />
          <span>Time: {formattedTime}</span>
        </div>
        {reminder.nextNotificationAt && (
           <div className="flex items-center text-foreground">
            <Repeat className="mr-2 h-4 w-4 text-accent" />
            <span>Next: {format(parseISO(reminder.nextNotificationAt), "MMM d, HH:mm")}</span>
          </div>
        )}
         <div className="flex items-center text-foreground pr-4">
          <AwardIcon className="mr-2 h-4 w-4 text-yellow-500" />
          <span>XP: {reminder.xpValue}</span>
        </div>
        {reminder.completed && (
          <div className="mt-2 text-sm font-semibold text-green-600 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Completed
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 pt-2 border-t mt-auto p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onComplete(reminder.id)} 
          disabled={reminder.completed || isCompleting || isSnoozing}
          aria-label={`Complete reminder: ${reminder.title}`}
          className="text-xs whitespace-nowrap min-w-[100px]"
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSnooze(reminder.id)} 
          disabled={reminder.completed || isCompleting || isSnoozing}
          aria-label={`Snooze reminder: ${reminder.title}`}
          className="text-xs whitespace-nowrap min-w-[80px]"
        >
          <XCircle className="mr-1 h-3.5 w-3.5" /> Snooze
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(reminder)} 
          disabled={reminder.completed || isCompleting || isSnoozing}
          aria-label={`Edit reminder: ${reminder.title}`}
          className="text-xs whitespace-nowrap min-w-[60px]"
        >
          <Edit className="mr-1 h-3.5 w-3.5" /> Edit
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(reminder.id)} 
          disabled={isCompleting || isSnoozing} 
          aria-label={`Delete reminder: ${reminder.title}`}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 text-xs whitespace-nowrap min-w-[70px]"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
