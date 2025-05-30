
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MatchOffer, ConfirmedMatch, Team } from '../types';
import * as matchOfferService from '../services/matchOfferService';
import * as confirmedMatchService from '../services/confirmedMatchService';
import * as teamService from '../services/teamService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MatchOfferCard } from '../components/cards/MatchOfferCard';
import { ConfirmedMatchCard } from '../components/cards/ConfirmedMatchCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<ConfirmedMatch[]>([]);
  const [recentOffers, setRecentOffers] = useState<MatchOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [userTeam, matches, offers] = await Promise.all([
          teamService.getTeamByInscriber(user.id),
          confirmedMatchService.getConfirmedMatchesForUser(user.id),
          matchOfferService.getMyOffers(user.id)
        ]);
        setTeam(userTeam);
        // Display upcoming matches (e.g., next 3)
        setUpcomingMatches(matches.filter(m => new Date(m.matchDateTime) >= new Date()).slice(0, 3));
        // Display recent open offers (e.g., latest 3)
        setRecentOffers(offers.filter(o => o.status === 'OPEN').slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Simulate sending reminders when dashboard loads (for demo)
  useEffect(() => {
    confirmedMatchService.checkAndSendReminders();
  }, []);


  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {team?.name || user.email}!</h1>
        <p className="text-gray-600">Here's a quick overview of your team's activity.</p>
      </div>

      {!team && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow" role="alert">
          <p className="font-bold">Team Setup Needed</p>
          <p>You haven't set up your team yet. <Link to="/my-team" className="font-semibold underline hover:text-yellow-800">Click here to create your team</Link> and start matching!</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/create-offer" className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Create New Match Offer
            </Link>
            <Link to="/search-offers" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Search for Opponents
            </Link>
            <Link to="/my-team" className="block w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Manage My Team
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Team Status</h2>
          {team ? (
            <ul className="space-y-2 text-gray-600">
              <li><strong>Team Name:</strong> {team.name}</li>
              <li><strong>Players Registered:</strong> {team.players.length}</li>
              {/* Add more stats here if desired */}
            </ul>
          ) : (
            <p className="text-gray-500">No team data available. Please create your team.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Confirmed Matches ({upcomingMatches.length})</h2>
        {upcomingMatches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {upcomingMatches.map(match => <ConfirmedMatchCard key={match.id} match={match} currentUserId={user.id} onCancel={() => { /* Implement refresh or state update */}} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-4 rounded-lg shadow">No upcoming matches scheduled. <Link to="/search-offers" className="text-blue-500 hover:underline">Find one now!</Link></p>
        )}
         <Link to="/confirmed-matches" className="mt-2 inline-block text-blue-500 hover:underline">View all confirmed matches &rarr;</Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Recent Open Offers ({recentOffers.length})</h2>
        {recentOffers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {recentOffers.map(offer => <MatchOfferCard key={offer.id} offer={offer} onAccept={() => { /* Not applicable here */ }} showAcceptButton={false} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-4 rounded-lg shadow">You have no open match offers. <Link to="/create-offer" className="text-blue-500 hover:underline">Create one!</Link></p>
        )}
        <Link to="/my-offers" className="mt-2 inline-block text-blue-500 hover:underline">View all your offers &rarr;</Link>
      </div>
    </div>
  );
};

export default DashboardPage;
