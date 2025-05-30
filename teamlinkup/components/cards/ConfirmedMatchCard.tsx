
import React, { useState } from 'react';
import { ConfirmedMatch } from '../../types';
import GoogleMapDisplay from '../GoogleMapDisplay';
import { MapPinIcon, CalendarDaysIcon, UsersIcon, ShieldCheckIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface ConfirmedMatchCardProps {
  match: ConfirmedMatch;
  currentUserId: string;
  onCancel: (matchId: string) => void;
  cancelling?: boolean;
}

export const ConfirmedMatchCard: React.FC<ConfirmedMatchCardProps> = ({ match, currentUserId, onCancel, cancelling }) => {
  const {
    sport, skillLevel, matchDateTime, venueName, venueAddress, 
    proposingTeamName, acceptingTeamName, proposingInscriberEmail, acceptingInscriberEmail, status, numPlayers
  } = match;

  const [showMap, setShowMap] = useState(false);

  const opponentTeamName = match.proposingInscriberId === currentUserId ? acceptingTeamName : proposingTeamName;
  const opponentEmail = match.proposingInscriberId === currentUserId ? acceptingInscriberEmail : proposingInscriberEmail;
  
  const matchDate = new Date(matchDateTime);
  const canCancel = new Date(matchDateTime).getTime() - new Date().getTime() > 48 * 60 * 60 * 1000; // More than 48 hours away

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${status === 'CONFIRMED' ? 'border-green-500' : 'border-red-500'}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{sport} - {skillLevel}</h3>
        {status === 'CONFIRMED' && <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Confirmed</span>}
        {status === 'CANCELLED' && <span className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Cancelled</span>}
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        <UserGroupIcon className="h-5 w-5 mr-1 inline text-purple-500" />
        Your Team vs. <span className="font-semibold">{opponentTeamName}</span> (Contact: {opponentEmail})
      </p>

      <div className="space-y-2 mt-4 text-gray-700">
        <div className="flex items-center">
          <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />
          <span>{matchDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
          <span>{matchDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
         <div className="flex items-center">
          <UsersIcon className="h-5 w-5 mr-2 text-green-500" />
          <span>{numPlayers} Players per team</span>
        </div>
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
          <span>{venueName} - {venueAddress}</span>
        </div>
         {match.venueDetails && <p className="text-sm text-gray-600 pl-7">Details: {match.venueDetails}</p>}
        {match.venuePhone && <p className="text-sm text-gray-600 pl-7">Phone: {match.venuePhone}</p>}
      </div>

      <div className="mt-4 space-x-2">
        <button 
            onClick={() => setShowMap(!showMap)}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-3 rounded-md transition-colors"
        >
            {showMap ? 'Hide Map' : 'Show Map'}
        </button>
        {status === 'CONFIRMED' && canCancel && (
          <button
            onClick={() => onCancel(match.id)}
            disabled={cancelling}
            className="text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-md transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Match'}
          </button>
        )}
        {status === 'CONFIRMED' && !canCancel && (
            <p className="text-xs text-yellow-600 mt-1 inline-block">Cancellation window closed (less than 48h to match).</p>
        )}
      </div>
      
      {showMap && (
        <div className="mt-4 border-t pt-4">
          <GoogleMapDisplay address={venueAddress} />
        </div>
      )}
    </div>
  );
};
