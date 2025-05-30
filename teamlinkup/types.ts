
export enum Sport {
  FOOTBALL = 'Football',
  BASKETBALL = 'Basketball',
  VOLLEYBALL = 'Volleyball',
  PADEL = 'Padel',
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export interface User {
  id: string;
  email: string;
}

export interface Player {
  id: string; // Local ID, e.g., generated on client
  name: string;
  email: string; // For Inscriber's reference
  age: number;   // For Inscriber's reference
}

export interface Team {
  id: string; // Associated with InscriberId, can be same as InscriberId for 1-to-1
  inscriberId: string;
  name: string;
  players: Player[];
}

export type MatchOfferStatus = 'OPEN' | 'ACCEPTED' | 'CANCELLED_BY_CREATOR' | 'EXPIRED';

export interface MatchOffer {
  id: string;
  creatorId: string; // Inscriber ID
  creatorEmail: string; // Denormalized for display
  teamName: string; // Denormalized for display
  sport: Sport;
  numPlayers: number;
  skillLevel: SkillLevel;
  availabilityDate: string; // YYYY-MM-DD
  availabilityTime: string; // HH:MM
  venueName: string;
  venueAddress: string;
  venuePhone?: string;
  venueDetails?: string;
  status: MatchOfferStatus;
}

export type ConfirmedMatchStatus = 'CONFIRMED' | 'CANCELLED';

export interface ConfirmedMatch {
  id: string;
  offerId: string;
  proposingInscriberId: string;
  proposingInscriberEmail: string;
  proposingTeamName: string;
  acceptingInscriberId: string;
  acceptingInscriberEmail: string;
  acceptingTeamName: string;
  sport: Sport;
  numPlayers: number;
  skillLevel: SkillLevel;
  matchDateTime: string; // ISO string (from offer's date and time)
  venueName: string;
  venueAddress: string;
  venuePhone?: string;
  venueDetails?: string;
  status: ConfirmedMatchStatus;
}

export interface Venue {
  name: string;
  address: string;
  phone?: string;
  details?: string;
}
