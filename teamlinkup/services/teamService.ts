
import { Team, Player } from '../types';
import { getItem, setItem } from './storageService';
import { MOCK_API_DELAY } from '../constants';

const TEAMS_KEY = 'mock_teams';

const getMockTeams = (): Team[] => getItem<Team[]>(TEAMS_KEY) || [];
const saveMockTeams = (teams: Team[]): void => setItem(TEAMS_KEY, teams);

export const getTeamByInscriber = (inscriberId: string): Promise<Team | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const teams = getMockTeams();
      const team = teams.find(t => t.inscriberId === inscriberId) || null;
      resolve(team);
    }, MOCK_API_DELAY);
  });
};

export const createOrUpdateTeam = (teamData: Omit<Team, 'id'> & { id?: string }): Promise<Team> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let teams = getMockTeams();
      const existingTeamIndex = teams.findIndex(t => t.inscriberId === teamData.inscriberId);
      
      let finalTeam: Team;
      if (existingTeamIndex !== -1) {
        // Update existing team
        finalTeam = { ...teams[existingTeamIndex], ...teamData, id: teams[existingTeamIndex].id };
        teams[existingTeamIndex] = finalTeam;
      } else {
        // Create new team
        finalTeam = { ...teamData, id: teamData.id || Date.now().toString() + Math.random().toString(36).substring(2,7) };
        teams.push(finalTeam);
      }
      saveMockTeams(teams);
      resolve(finalTeam);
    }, MOCK_API_DELAY);
  });
};

// Helper to generate unique player ID
export const generatePlayerId = (): string => `player_${Date.now().toString()}_${Math.random().toString(36).substring(2, 7)}`;
