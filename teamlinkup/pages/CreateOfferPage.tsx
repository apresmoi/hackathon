
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MatchOffer, Sport, SkillLevel, Team } from '../types';
import { SPORT_OPTIONS, SKILL_LEVEL_OPTIONS } from '../constants';
import * as matchOfferService from '../services/matchOfferService';
import * as teamService from '../services/teamService';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateOfferPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);

  const [sport, setSport] = useState<Sport>(SPORT_OPTIONS[0]);
  const [numPlayers, setNumPlayers] = useState<number>(5);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SKILL_LEVEL_OPTIONS[0]);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availabilityTime, setAvailabilityTime] = useState('');
  
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venuePhone, setVenuePhone] = useState('');
  const [venueDetails, setVenueDetails] = useState('');

  const [loadingTeam, setLoadingTeam] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user) return;
      setLoadingTeam(true);
      try {
        const userTeam = await teamService.getTeamByInscriber(user.id);
        if (!userTeam || userTeam.players.length === 0) {
          setError('You need to create a team with players before creating an offer.');
          // Optionally redirect: navigate('/my-team');
        }
        setTeam(userTeam);
      } catch (err) {
        setError('Could not load your team data. Please try again.');
        console.error(err);
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeamData();
  }, [user, navigate]);

  const handleSportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const matchedOption = SPORT_OPTIONS.find(opt => opt === selectedValue);
    if (matchedOption) {
      setSport(matchedOption);
    }
  };

  const handleSkillLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const matchedOption = SKILL_LEVEL_OPTIONS.find(opt => opt === selectedValue);
    if (matchedOption) {
      setSkillLevel(matchedOption);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !team) {
      setError('User or team data is missing.');
      return;
    }
    if (!availabilityDate || !availabilityTime) {
        setError('Please select a valid date and time for the match.');
        return;
    }
    
    const matchDateTime = new Date(`${availabilityDate}T${availabilityTime}`);
    if (matchDateTime <= new Date()) {
        setError('Match date and time must be in the future.');
        return;
    }

    setError('');
    setSubmitting(true);
    
    const offerData: Omit<MatchOffer, 'id' | 'status' | 'creatorId' | 'creatorEmail' | 'teamName'> = {
      sport,
      numPlayers,
      skillLevel,
      availabilityDate,
      availabilityTime,
      venueName,
      venueAddress,
      venuePhone,
      venueDetails,
    };

    try {
      await matchOfferService.createOffer({ ...offerData, creatorId: user.id, creatorEmail: user.email, teamName: team.name }, user);
      alert('Match offer created successfully!');
      navigate('/my-offers');
    } catch (err: any) {
      setError(err.message || 'Failed to create match offer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTeam) return <LoadingSpinner message="Loading team information..." />;
  if (error && !team) { // Critical error like no team, prevent form display
      return (
          <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-700">{error}</p>
              {(!team || team?.players.length === 0) && 
                <button onClick={() => navigate('/my-team')} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                  Go to My Team
                </button>
              }
          </div>
      );
  }


  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Match Offer</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Match Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-1">Sport</label>
              <select id="sport" value={sport} onChange={handleSportChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500">
                {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="numPlayers" className="block text-gray-700 text-sm font-semibold mb-1">Number of Players (Your Team)</label>
              <input type="number" id="numPlayers" value={numPlayers} onChange={(e) => setNumPlayers(parseInt(e.target.value))} min="1" max="20" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="skillLevel" className="block text-gray-700 text-sm font-semibold mb-1">Skill Level</label>
              <select id="skillLevel" value={skillLevel} onChange={handleSkillLevelChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500">
                {SKILL_LEVEL_OPTIONS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Availability</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="availabilityDate" className="block text-gray-700 text-sm font-semibold mb-1">Preferred Date</label>
                    <input type="date" id="availabilityDate" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                    <label htmlFor="availabilityTime" className="block text-gray-700 text-sm font-semibold mb-1">Preferred Time</label>
                    <input type="time" id="availabilityTime" value={availabilityTime} onChange={(e) => setAvailabilityTime(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" />
                </div>
            </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Venue Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="venueName" className="block text-gray-700 text-sm font-semibold mb-1">Venue Name</label>
              <input type="text" id="venueName" value={venueName} onChange={(e) => setVenueName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="e.g., City Sports Park"/>
            </div>
            <div>
              <label htmlFor="venueAddress" className="block text-gray-700 text-sm font-semibold mb-1">Venue Address</label>
              <input type="text" id="venueAddress" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="123 Main St, Anytown"/>
            </div>
            <div>
              <label htmlFor="venuePhone" className="block text-gray-700 text-sm font-semibold mb-1">Venue Phone (Optional)</label>
              <input type="tel" id="venuePhone" value={venuePhone} onChange={(e) => setVenuePhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="555-123-4567"/>
            </div>
            <div>
              <label htmlFor="venueDetails" className="block text-gray-700 text-sm font-semibold mb-1">Other Venue Details (Optional)</label>
              <textarea id="venueDetails" value={venueDetails} onChange={(e) => setVenueDetails(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" placeholder="e.g., Indoor court, Field 3, Parking available"></textarea>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={submitting || !team || team.players.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
        >
          {submitting ? <LoadingSpinner size="sm" /> : 'Create Match Offer'}
        </button>
         {(!team || team.players.length === 0) && <p className="text-red-500 text-sm mt-2">You must have a team with players to create an offer.</p>}
      </form>
    </div>
  );
};

export default CreateOfferPage;
