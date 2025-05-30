
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MatchOffer, Sport, SkillLevel, Team } from '../types';
import { SPORT_OPTIONS, SKILL_LEVEL_OPTIONS } from '../constants';
import * as matchOfferService from '../services/matchOfferService';
import * as teamService from '../services/teamService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MatchOfferCard } from '../components/cards/MatchOfferCard';

const SearchOffersPage: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null); // For context, if needed
  const [searchCriteria, setSearchCriteria] = useState({
    sport: '' as Sport | '',
    skillLevel: '' as SkillLevel | '',
    date: '',
    numPlayers: '' as number | '',
  });
  const [results, setResults] = useState<MatchOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  // Fetch user's team to ensure they have one, potentially for default numPlayers
   useEffect(() => {
    const fetchUserTeam = async () => {
      if (user) {
        try {
          const userTeam = await teamService.getTeamByInscriber(user.id);
          setTeam(userTeam);
          if (userTeam && !searchCriteria.numPlayers) { // Pre-fill numPlayers if team exists and not set
             setSearchCriteria(prev => ({...prev, numPlayers: userTeam.players.length > 0 ? userTeam.players.length : ''}));
          }
        } catch (err) {
          console.error("Could not fetch user team for search defaults:", err);
        }
      }
    };
    fetchUserTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // searchCriteria.numPlayers removed from deps to avoid re-fetch on its change by this effect


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value: rawValue } = e.target;

    if (name === 'sport') {
      const matchedOption = SPORT_OPTIONS.find(opt => opt === rawValue);
      if (rawValue === "" || matchedOption) { // Allow empty string or a valid sport
        setSearchCriteria(prev => ({ ...prev, sport: rawValue as Sport | "" }));
      }
    } else if (name === 'skillLevel') {
      const matchedOption = SKILL_LEVEL_OPTIONS.find(opt => opt === rawValue);
      if (rawValue === "" || matchedOption) { // Allow empty string or a valid skill level
        setSearchCriteria(prev => ({ ...prev, skillLevel: rawValue as SkillLevel | "" }));
      }
    } else if (name === 'numPlayers') {
        setSearchCriteria(prev => ({ ...prev, numPlayers: rawValue ? parseInt(rawValue) : '' }));
    } else {
        setSearchCriteria(prev => ({ ...prev, [name]: rawValue }));
    }
  };

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setError("You must be logged in to search for offers.");
      return;
    }
     if (!team || team.players.length === 0) {
      setError("You need to have a team with players to accept offers. Please set up your team first.");
      setResults([]);
      setSearched(true); // Mark as searched to show the error message
      return;
    }

    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const offers = await matchOfferService.searchOffers({
        sport: searchCriteria.sport || undefined,
        skillLevel: searchCriteria.skillLevel || undefined,
        date: searchCriteria.date || undefined,
        numPlayers: searchCriteria.numPlayers || undefined,
      }, user.id);
      setResults(offers);
    } catch (err: any) {
      setError(err.message || 'Failed to search for offers.');
    } finally {
      setLoading(false);
    }
  }, [user, searchCriteria, team]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!user) {
        alert("Login required.");
        return;
    }
    if (!team || team.players.length === 0) {
        alert("You must have a team with players to accept an offer. Please set up your team.");
        return;
    }
    if (!window.confirm("Are you sure you want to accept this match offer? This will confirm the match.")) {
        return;
    }

    setAcceptingOfferId(offerId);
    setError('');
    try {
        await matchOfferService.acceptOffer(offerId, user);
        alert("Match offer accepted successfully! Check your confirmed matches.");
        // Refresh results or navigate to confirmed matches
        handleSearch(); // Re-run search to remove accepted offer
    } catch (err: any) {
        setError(err.message || "Failed to accept offer.");
        alert(err.message || "Failed to accept offer. It might have been taken or an error occurred.");
    } finally {
        setAcceptingOfferId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Search for Match Offers</h2>
      
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-lg mb-8 space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-gray-700">Sport</label>
            <select name="sport" id="sport" value={searchCriteria.sport} onChange={handleInputChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">Any Sport</option>
              {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">Skill Level</label>
            <select name="skillLevel" id="skillLevel" value={searchCriteria.skillLevel} onChange={handleInputChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">Any Skill Level</option>
              {SKILL_LEVEL_OPTIONS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" id="date" value={searchCriteria.date} onChange={handleInputChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label htmlFor="numPlayers" className="block text-sm font-medium text-gray-700">Number of Players</label>
            <input type="number" name="numPlayers" id="numPlayers" value={searchCriteria.numPlayers} onChange={handleInputChange} min="1" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Exact #" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Searching...' : 'Search Offers'}
        </button>
      </form>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      
      {loading && <LoadingSpinner message="Searching for offers..." />}

      {!loading && searched && results.length === 0 && !error && (
        <div className="text-center py-10 bg-white p-8 rounded-lg shadow">
            <img src="https://picsum.photos/seed/noresults/150/150" alt="No results" className="mx-auto mb-4 rounded-full" />
            <p className="text-gray-600 text-xl">No match offers found for your criteria.</p>
            <p className="text-gray-500">Try broadening your search or check back later!</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-700">Search Results ({results.length})</h3>
          {results.map(offer => (
            <MatchOfferCard
              key={offer.id}
              offer={offer}
              onAccept={handleAcceptOffer}
              showAcceptButton={!!user && !!team && team.players.length > 0 && team.players.length === offer.numPlayers}
              accepting={acceptingOfferId === offer.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchOffersPage;
