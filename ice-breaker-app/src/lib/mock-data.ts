
import type { User, Icebreaker, Entry, Comment } from './types';

const MOCK_USERS_COUNT = 20;
const MOCK_ICEBREAKERS_COUNT = 5;
const MOCK_ENTRIES_PER_ICEBREAKER_MIN = 1; // Creator's entry
const MOCK_ENTRIES_PER_ICEBREAKER_MAX = 3; // Additional entries/responses
const MOCK_COMMENTS_PER_ENTRY_MIN = 0;
const MOCK_COMMENTS_PER_ENTRY_MAX = 3;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start = new Date(2023, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const samplePrompts = [
  { title: "Desk Snapshot", description: "Share a photo of your current workspace setup. What's your favorite item on your desk?" },
  { title: "Dream Vacation", description: "If you could teleport anywhere for a week, where would you go and why?" },
  { title: "Hidden Talent", description: "What's a surprising skill or talent you have that most people don't know about?" },
  { title: "Favorite Comfort Food", description: "What's your go-to comfort food and a quick story about why it's special to you?" },
  { title: "Throwback Photo", description: "Post a photo of yourself from a memorable past event or trip. No context needed initially!" },
  { title: "Two Truths and a Lie", description: "Share two true statements and one lie about yourself. Let others guess!" },
  { title: "Current Read/Watch", description: "What book are you currently reading or show are you binge-watching?" },
];

export const mockUsers: User[] = Array.from({ length: MOCK_USERS_COUNT }, (_, i) => ({
  id: `user-${i + 1}`,
  displayName: `User ${String.fromCharCode(65 + i)}`, // User A, User B, ...
  email: `user${i + 1}@example.com`,
  avatarUrl: `https://placehold.co/100x100.png?text=${String.fromCharCode(65 + i)}`,
  role: i === 0 ? 'admin' : 'employee',
  iceLevel: getRandomInt(0, 100),
  activityScore: getRandomInt(10, 200),
}));

export const mockIcebreakers: Icebreaker[] = [];
export const mockEntries: Entry[] = [];
export const mockComments: Comment[] = [];

const usedPrompts = new Set<string>();

for (let i = 0; i < MOCK_ICEBREAKERS_COUNT; i++) {
  const author = mockUsers[getRandomInt(0, mockUsers.length - 1)];
  let prompt = samplePrompts[getRandomInt(0, samplePrompts.length - 1)];
  while (usedPrompts.has(prompt.title) && usedPrompts.size < samplePrompts.length) {
    prompt = samplePrompts[getRandomInt(0, samplePrompts.length - 1)];
  }
  usedPrompts.add(prompt.title);
  
  const icebreakerId = `icebreaker-${i + 1}`;
  const icebreakerCreatedAt = getRandomDate();

  const icebreaker: Icebreaker = {
    id: icebreakerId,
    title: prompt.title,
    description: prompt.description,
    topicType: Math.random() > 0.5 ? 'mixed' : (Math.random() > 0.5 ? 'photo' : 'text'),
    authorId: author.id,
    author,
    createdAt: icebreakerCreatedAt.toISOString(),
    interactionCount: 0, // Will be calculated later
    entries: [],
  };

  const numEntries = getRandomInt(MOCK_ENTRIES_PER_ICEBREAKER_MIN, MOCK_ENTRIES_PER_ICEBREAKER_MAX);
  for (let j = 0; j < numEntries; j++) {
    const entryAuthor = mockUsers[getRandomInt(0, mockUsers.length - 1)];
    const entryId = `${icebreakerId}-entry-${j + 1}`;
    const entryCreatedAt = getRandomDate(icebreakerCreatedAt);
    
    const entry: Entry = {
      id: entryId,
      icebreakerId: icebreaker.id,
      authorId: entryAuthor.id,
      author: entryAuthor,
      text: `This is entry ${j+1} for "${icebreaker.title}". My thoughts are... ${Math.random().toString(36).substring(7)}.`,
      contentUrl: icebreaker.topicType !== 'text' && Math.random() > 0.3 ? `https://placehold.co/600x400.png` : undefined,
      createdAt: entryCreatedAt.toISOString(),
      likeCount: getRandomInt(0, 50),
      comments: [],
    };
    if (entry.contentUrl && !entry.text) {
      entry.text = `Check out this image for "${icebreaker.title}"!`;
    } else if (entry.contentUrl && entry.text) {
      entry.text = `Check out this image! ${entry.text}`;
    }


    const numComments = getRandomInt(MOCK_COMMENTS_PER_ENTRY_MIN, MOCK_COMMENTS_PER_ENTRY_MAX);
    for (let k = 0; k < numComments; k++) {
      const commentAuthor = mockUsers[getRandomInt(0, mockUsers.length - 1)];
      const comment: Comment = {
        id: `${entryId}-comment-${k + 1}`,
        entryId: entry.id,
        authorId: commentAuthor.id,
        author: commentAuthor,
        text: `This is comment ${k+1}. I agree! ${Math.random().toString(36).substring(7)}.`,
        createdAt: getRandomDate(entryCreatedAt).toISOString(),
      };
      entry.comments.push(comment);
      mockComments.push(comment);
    }
    
    icebreaker.entries.push(entry);
    mockEntries.push(entry);
    icebreaker.interactionCount += entry.likeCount + entry.comments.length;
  }
  
  // Sort entries by date, most recent first
  icebreaker.entries.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  mockIcebreakers.push(icebreaker);
}

// Sort icebreakers by date, most recent first
mockIcebreakers.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
mockUsers.sort((a,b) => (b.activityScore || 0) - (a.activityScore || 0));

// A helper to get a user by ID
export const getMockUserById = (id: string): User | undefined => mockUsers.find(u => u.id === id);

// Placeholder for current user (e.g. first admin or a random user)
export const currentMockUser = mockUsers.find(u => u.role === 'admin') || mockUsers[0];


// New helper functions
export const getMockIcebreakerById = (id: string): Icebreaker | undefined => mockIcebreakers.find(ib => ib.id === id);

export function addIcebreakerWithFirstEntry(icebreaker: Icebreaker, firstEntry: Entry) {
  // Ensure IDs are linked
  firstEntry.icebreakerId = icebreaker.id;
  icebreaker.entries = [firstEntry];
  icebreaker.interactionCount = firstEntry.likeCount + firstEntry.comments.length; // Initialize interaction count

  mockIcebreakers.unshift(icebreaker); // Add to the beginning (most recent)
  mockEntries.push(firstEntry);

  // If you want to strictly maintain sort order after every addition:
  // mockIcebreakers.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addEntryToIcebreaker(icebreakerId: string, entry: Entry) {
  const icebreaker = getMockIcebreakerById(icebreakerId);
  if (icebreaker) {
    entry.icebreakerId = icebreakerId; // Ensure linked
    
    icebreaker.entries.unshift(entry); // Add to beginning of specific icebreaker's entries
    // To strictly maintain sort order:
    // icebreaker.entries.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    mockEntries.push(entry);
    
    // Update interaction count for the parent icebreaker
    icebreaker.interactionCount += entry.likeCount + entry.comments.length;
  } else {
    console.warn(`Tried to add entry to non-existent icebreaker ID: ${icebreakerId}`);
  }
}
