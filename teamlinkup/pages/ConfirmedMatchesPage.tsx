
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ConfirmedMatch } from '../types';
import * as confirmedMatchService from '../services/confirmedMatchService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ConfirmedMatchCard } from '../components/cards/ConfirmedMatchCard';
import { Link } from 'react-router-dom';

const ConfirmedMatchesPage: React.FC = () => {
  const { user } = useAuth();
  const [confirmedMatches, setConfirmedMatches] = useState<ConfirmedMatch[]>([]);
  const [cancelledMatches, setCancelledMatches] = useState<ConfirmedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingMatchId, setCancellingMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'confirmed' | 'cancelled'>('confirmed');


  const fetchMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [confirmed, cancelled] = await Promise.all([
        confirmedMatchService.getConfirmedMatchesForUser(user.id),
        confirmedMatchService.getCancelledMatchesForUser(user.id)
      ]);
      setConfirmedMatches(confirmed);
      setCancelledMatches(cancelled);
    } catch (err: any) {
      setError(err.message || 'Failed to load your matches.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleCancelMatch = async (matchId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to cancel this match? This will notify the other team.")) {
        return;
    }
    setCancellingMatchId(matchId);
    setError('');
    try {
        await confirmedMatchService.cancelConfirmedMatch(matchId, user.id);
        alert("Match cancelled successfully. The other team has been notified (simulated).");
        fetchMatches(); // Refresh the list
    } catch (err: any)
     {
        setError(err.message || "Failed to cancel match.");
        alert(err.message || "Failed to cancel match. Please check cancellation policy (48 hours).");
    } finally {
        setCancellingMatchId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your matches..." />;

  const matchesToShow = activeTab === 'confirmed' ? confirmedMatches : cancelledMatches;
  const tabTitle = activeTab === 'confirmed' ? 'Upcoming & Past Confirmed Matches' : 'Cancelled Matches';

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Matches</h2>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`${
              activeTab === 'confirmed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Confirmed ({confirmedMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`${
              activeTab === 'cancelled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Cancelled ({cancelledMatches.length})
          </button>
        </nav>
      </div>

      <h3 className="text-2xl font-semibold text-gray-700 mb-6">{tabTitle}</h3>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}

      {matchesToShow.length === 0 ? (
        <div className="text-center py-10 bg-white p-8 rounded-lg shadow">
          <img src="https://picsum.photos/seed/nomatches/150/150" alt="No matches" className="mx-auto mb-4 rounded-full" />
          <p className="text-gray-600 text-xl">
            {activeTab === 'confirmed' 
                ? "You have no confirmed matches." 
                : "You have no cancelled matches."}
          </p>
          {activeTab === 'confirmed' && 
            <Link to="/search-offers" className="mt-4 inline-block text-blue-500 hover:underline font-semibold">
                Find a match to play!
            </Link>
          }
        </div>
      ) : (
        <div className="space-y-6">
          {matchesToShow.map(match => (
            <ConfirmedMatchCard
              key={match.id}
              match={match}
              currentUserId={user!.id}
              onCancel={handleCancelMatch}
              cancelling={cancellingMatchId === match.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfirmedMatchesPage;
