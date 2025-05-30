
import { ConfirmedMatch, MatchOffer, User, ConfirmedMatchStatus } from '../types';
import { getItem, setItem } from './storageService';
import { MOCK_API_DELAY } from '../constants';
import * as notificationService from './notificationService';

const CONFIRMED_MATCHES_KEY = 'mock_confirmed_matches';

const getMockConfirmedMatches = (): ConfirmedMatch[] => getItem<ConfirmedMatch[]>(CONFIRMED_MATCHES_KEY) || [];
const saveMockConfirmedMatches = (matches: ConfirmedMatch[]): void => setItem(CONFIRMED_MATCHES_KEY, matches);

export const createConfirmedMatchFromOffer = (
  offer: MatchOffer,
  acceptingUser: User,
  acceptingTeamName: string
): Promise<ConfirmedMatch> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matches = getMockConfirmedMatches();
      const matchDateTime = new Date(`${offer.availabilityDate}T${offer.availabilityTime}:00`).toISOString();

      const newMatch: ConfirmedMatch = {
        id: `match_${Date.now().toString()}_${Math.random().toString(36).substring(2, 7)}`,
        offerId: offer.id,
        proposingInscriberId: offer.creatorId,
        proposingInscriberEmail: offer.creatorEmail,
        proposingTeamName: offer.teamName,
        acceptingInscriberId: acceptingUser.id,
        acceptingInscriberEmail: acceptingUser.email,
        acceptingTeamName: acceptingTeamName,
        sport: offer.sport,
        numPlayers: offer.numPlayers,
        skillLevel: offer.skillLevel,
        matchDateTime: matchDateTime,
        venueName: offer.venueName,
        venueAddress: offer.venueAddress,
        venuePhone: offer.venuePhone,
        venueDetails: offer.venueDetails,
        status: 'CONFIRMED',
      };
      matches.push(newMatch);
      saveMockConfirmedMatches(matches);
      resolve(newMatch);
    }, MOCK_API_DELAY / 2);
  });
};

export const getConfirmedMatchesForUser = (userId: string): Promise<ConfirmedMatch[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matches = getMockConfirmedMatches();
      resolve(
        matches.filter(m => (m.proposingInscriberId === userId || m.acceptingInscriberId === userId) && m.status === 'CONFIRMED')
               .sort((a,b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime())
      );
    }, MOCK_API_DELAY);
  });
};

export const getCancelledMatchesForUser = (userId: string): Promise<ConfirmedMatch[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matches = getMockConfirmedMatches();
      resolve(
        matches.filter(m => (m.proposingInscriberId === userId || m.acceptingInscriberId === userId) && m.status === 'CANCELLED')
               .sort((a,b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime())
      );
    }, MOCK_API_DELAY);
  });
};


export const cancelConfirmedMatch = (matchId: string, cancellingUserId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let matches = getMockConfirmedMatches();
      const matchIndex = matches.findIndex(m => m.id === matchId);

      if (matchIndex === -1) {
        reject(new Error("Match not found."));
        return;
      }

      const matchToCancel = matches[matchIndex];
      if (matchToCancel.status !== 'CONFIRMED') {
        reject(new Error("Match is not currently confirmed."));
        return;
      }
      
      if (matchToCancel.proposingInscriberId !== cancellingUserId && matchToCancel.acceptingInscriberId !== cancellingUserId) {
        reject(new Error("You are not part of this match."));
        return;
      }

      const matchTime = new Date(matchToCancel.matchDateTime).getTime();
      const now = new Date().getTime();
      const hoursBeforeMatch = (matchTime - now) / (1000 * 60 * 60);

      if (hoursBeforeMatch < 48) {
        reject(new Error("Match cannot be cancelled less than 48 hours before its scheduled time."));
        return;
      }

      matchToCancel.status = 'CANCELLED';
      saveMockConfirmedMatches(matches);

      // Notify the other Inscriber
      const otherInscriberEmail = matchToCancel.proposingInscriberId === cancellingUserId 
        ? matchToCancel.acceptingInscriberEmail 
        : matchToCancel.proposingInscriberEmail;
      
      notificationService.sendMatchCancellationEmail(otherInscriberEmail, matchToCancel);
      
      resolve(true);
    }, MOCK_API_DELAY);
  });
};

// Simulate sending reminders (in a real app, this would be a scheduled task)
export const checkAndSendReminders = async (): Promise<void> => {
    console.log("Checking for match reminders...");
    const matches = getMockConfirmedMatches().filter(m => m.status === 'CONFIRMED');
    const now = new Date().getTime();

    for (const match of matches) {
        const matchTime = new Date(match.matchDateTime).getTime();
        const hoursBeforeMatch = (matchTime - now) / (1000 * 60 * 60);

        // Send reminder if match is between 23 and 25 hours away (roughly 1 day)
        // And if reminder hasn't been sent (add a flag to match object or use a separate store for sent reminders in real app)
        // For mock, we'll just check time window. A real app needs to prevent multiple reminders.
        const reminderAlreadySentKey = `reminder_sent_${match.id}`;
        if (hoursBeforeMatch > 0 && hoursBeforeMatch <= 24 && !getItem(reminderAlreadySentKey)) {
            notificationService.sendMatchReminderEmail(match.proposingInscriberEmail, match);
            notificationService.sendMatchReminderEmail(match.acceptingInscriberEmail, match);
            setItem(reminderAlreadySentKey, true); // Mark as sent
            console.log(`Reminder sent for match ${match.id}`);
        }
    }
};
// Periodically check for reminders (e.g., every hour in a real app via cron)
// For this mock, you could call it manually or on certain app events.
// setInterval(checkAndSendReminders, 1000 * 60 * 60); // Example: check every hour
