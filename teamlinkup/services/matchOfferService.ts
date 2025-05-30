
import { MatchOffer, MatchOfferStatus, Sport, SkillLevel, ConfirmedMatch, User } from '../types';
import { getItem, setItem } from './storageService';
import { MOCK_API_DELAY } from '../constants';
import * as teamService from './teamService';
import * as confirmedMatchService from './confirmedMatchService';
import * as notificationService from './notificationService'; // For simulated notifications

const MATCH_OFFERS_KEY = 'mock_match_offers';

const getMockMatchOffers = (): MatchOffer[] => getItem<MatchOffer[]>(MATCH_OFFERS_KEY) || [];
const saveMockMatchOffers = (offers: MatchOffer[]): void => setItem(MATCH_OFFERS_KEY, offers);

export const createOffer = (offerData: Omit<MatchOffer, 'id' | 'status'>, creator: User): Promise<MatchOffer> => {
  return new Promise(async (resolve) => {
    const team = await teamService.getTeamByInscriber(creator.id);
    setTimeout(() => {
      let offers = getMockMatchOffers();
      const newOffer: MatchOffer = {
        ...offerData,
        id: Date.now().toString() + Math.random().toString(36).substring(2,9),
        status: 'OPEN',
        creatorEmail: creator.email,
        teamName: team?.name || 'Unknown Team', // Get team name
      };
      offers.push(newOffer);
      saveMockMatchOffers(offers);
      resolve(newOffer);
    }, MOCK_API_DELAY);
  });
};

export const getMyOffers = (creatorId: string): Promise<MatchOffer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const offers = getMockMatchOffers();
      resolve(offers.filter(o => o.creatorId === creatorId).sort((a,b) => new Date(b.availabilityDate).getTime() - new Date(a.availabilityDate).getTime()));
    }, MOCK_API_DELAY);
  });
};

interface SearchCriteria {
  sport?: Sport;
  skillLevel?: SkillLevel;
  date?: string; // YYYY-MM-DD
  numPlayers?: number;
}

export const searchOffers = (criteria: SearchCriteria, currentUserId: string): Promise<MatchOffer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let offers = getMockMatchOffers();
      offers = offers.filter(o => o.status === 'OPEN' && o.creatorId !== currentUserId); // Only open offers not by current user

      if (criteria.sport) {
        offers = offers.filter(o => o.sport === criteria.sport);
      }
      if (criteria.skillLevel) {
        offers = offers.filter(o => o.skillLevel === criteria.skillLevel);
      }
      if (criteria.date) {
        offers = offers.filter(o => o.availabilityDate === criteria.date);
      }
      if (criteria.numPlayers) {
        offers = offers.filter(o => o.numPlayers === criteria.numPlayers);
      }
      resolve(offers.sort((a,b) => new Date(a.availabilityDate).getTime() - new Date(b.availabilityDate).getTime()));
    }, MOCK_API_DELAY);
  });
};

export const acceptOffer = async (offerId: string, acceptingUser: User): Promise<ConfirmedMatch | null> => {
  let offers = getMockMatchOffers();
  const offerIndex = offers.findIndex(o => o.id === offerId);

  if (offerIndex === -1 || offers[offerIndex].status !== 'OPEN') {
    throw new Error("Offer not found or no longer open.");
  }

  const offerToAccept = offers[offerIndex];
  offerToAccept.status = 'ACCEPTED';
  saveMockMatchOffers(offers);
  
  const acceptingTeam = await teamService.getTeamByInscriber(acceptingUser.id);

  // Create Confirmed Match
  const confirmedMatch = await confirmedMatchService.createConfirmedMatchFromOffer(offerToAccept, acceptingUser, acceptingTeam?.name || 'Opponent Team');

  // Simulate notifications
  notificationService.sendMatchConfirmationEmail(offerToAccept.creatorEmail, confirmedMatch, true);
  notificationService.sendMatchConfirmationEmail(acceptingUser.email, confirmedMatch, false);
  
  return confirmedMatch;
};

export const cancelOfferByCreator = (offerId: string, creatorId: string): Promise<boolean> => {
   return new Promise((resolve, reject) => {
    setTimeout(() => {
      let offers = getMockMatchOffers();
      const offerIndex = offers.findIndex(o => o.id === offerId && o.creatorId === creatorId);

      if (offerIndex === -1) {
        reject(new Error("Offer not found or you are not the creator."));
        return;
      }
      if (offers[offerIndex].status !== 'OPEN') {
         reject(new Error("Only OPEN offers can be cancelled. This offer might have been accepted."));
         return;
      }
      
      offers[offerIndex].status = 'CANCELLED_BY_CREATOR';
      saveMockMatchOffers(offers);
      resolve(true);
    }, MOCK_API_DELAY);
  });
};
