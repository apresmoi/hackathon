import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Reminder } from '@/types/reminder';
import { reminders as dbReminders, DEFAULT_XP_VALUE, DEFAULT_REMINDER_ICON } from '@/lib/db'; // Import the db array

export async function GET(request: NextRequest) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return a copy and sort
  return NextResponse.json([...dbReminders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newReminder: Reminder = {
      id: String(Date.now()), // Simple ID generation
      title: body.title,
      description: body.description,
      time: body.time,
      frequency: body.frequency,
      icon: body.icon || DEFAULT_REMINDER_ICON,
      completed: false, // New reminders are not completed
      xpValue: DEFAULT_XP_VALUE, // Default XP value for new reminders
      createdAt: new Date().toISOString(),
    };
    dbReminders.push(newReminder); // Modify the db array directly
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(newReminder, { status: 201 });
  } catch (error) {
    console.error("Failed to create reminder:", error);
    return NextResponse.json({ message: "Error creating reminder", error: (error as Error).message }, { status: 400 });
  }
}
