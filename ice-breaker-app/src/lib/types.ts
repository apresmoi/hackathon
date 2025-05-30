
export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  role: 'employee' | 'admin';
  iceLevel: number; // 0-100, starts at 100
  activityScore?: number; // For leaderboards
}

export interface Icebreaker {
  id: string;
  title: string;
  description: string; // Prompt description
  topicType: 'photo' | 'text' | 'mixed';
  authorId: string; // User ID of the icebreaker prompt creator
  author?: User; // Populated author info
  createdAt: string; // ISO string
  interactionCount: number; // sum of likes + comments on all entries for this icebreaker
  entries: Entry[]; // Typically one primary entry by the creator, others could be responses
}

export interface Entry {
  id: string;
  icebreakerId: string;
  authorId: string;
  author?: User; // Populated author info
  text?: string;
  contentUrl?: string; // for image
  createdAt: string; // ISO string
  likeCount: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  entryId: string;
  authorId: string;
  author?: User; // Populated author info
  text: string;
  createdAt: string; // ISO string
}
