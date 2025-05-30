export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  familyId: string | null;
  isAdmin?: boolean;
  points?: number;
  // Add other profile fields as needed
}

export interface Family {
  id: string;
  name: string;
  adminUids: string[]; // Changed from adminUid to support multiple admins if needed in future, for now first is primary
  memberUids: string[];
}

export type ChoreRecurrence = 'one-time' | 'daily' | 'weekly';

export type ChoreStatus = 'Available' | 'In Progress' | 'Completed';

export interface Chore {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  recurrence: ChoreRecurrence;
  dueDate?: Date | string; // Store as ISO string or Timestamp in Firestore
  assignedTo?: string | null; // UID of the user
  completedBy?: string | null; // UID of the user who completed it
  status: ChoreStatus;
  dislikeValues: { [userId: string]: number }; // e.g., { "userId1": 7, "userId2": 3 }
  rewardPoints?: number;
  urgencyBonus?: number; // Added for urgent chores
  createdAt: Date | string; // Store as ISO string or Timestamp
  updatedAt: Date | string; // Store as ISO string or Timestamp
}

export interface Activity {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  action: string; // e.g., "completed a chore", "claimed a chore", "earned points"
  choreTitle?: string;
  pointsEarned?: number;
  timestamp: Date | string;
}
