
import React from 'react';
import { MatchOffer } from '../../types';
import { MapPinIcon, CalendarDaysIcon, UsersIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline'; // Using Heroicons

interface MatchOfferCardProps {
  offer: MatchOffer;
  onAccept?: (offerId: string) => void;
  onCancel?: (offerId: string) => void;
  showAcceptButton?: boolean;
  showCancelButton?: boolean;
  accepting?: boolean;
  cancelling?: boolean;
}

export const MatchOfferCard: React.FC<MatchOfferCardProps> = ({ 
    offer, 
    onAccept, 
    onCancel, 
    showAcceptButton = true, 
    showCancelButton = false,
    accepting = false,
    cancelling = false
}) => {
  const { 
    sport, numPlayers, skillLevel, availabilityDate, availabilityTime, 
    venueName, venueAddress, teamName, creatorEmail, status 
  } = offer;

  const offerDateTime = new Date(`${availabilityDate}T${availabilityTime}`);
  const isPast = offerDateTime < new Date() && status === 'OPEN';


  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${status === 'OPEN' && !isPast ? 'border-blue-500' : (status === 'ACCEPTED' ? 'border-green-500' : 'border-gray-400')}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{sport} - {skillLevel}</h3>
        {status === 'OPEN' && !isPast && <span className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">Open</span>}
        {status === 'OPEN' && isPast && <span className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-full">Expired</span>}
        {status === 'ACCEPTED' && <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Accepted</span>}
        {status === 'CANCELLED_BY_CREATOR' && <span className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Cancelled</span>}
      </div>
      
      <p className="text-sm text-gray-500 mb-1">Offered by: {teamName} ({creatorEmail})</p>

      <div className="space-y-2 mt-4 text-gray-700">
        <div className="flex items-center">
          <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />
          <span>{new Date(availabilityDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
          <span>{availabilityTime}</span>
        </div>
        <div className="flex items-center">
          <UsersIcon className="h-5 w-5 mr-2 text-green-500" />
          <span>{numPlayers} Players</span>
        </div>
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
          <span>{venueName} - {venueAddress}</span>
        </div>
        {offer.venueDetails && <p className="text-sm text-gray-600 pl-7">Details: {offer.venueDetails}</p>}
        {offer.venuePhone && <p className="text-sm text-gray-600 pl-7">Phone: {offer.venuePhone}</p>}
      </div>

      {(showAcceptButton && onAccept && status === 'OPEN' && !isPast) && (
        <button
          onClick={() => onAccept(offer.id)}
          disabled={accepting}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {accepting ? (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".4"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" transform="rotate(90 12 12)"/></svg>
          ) : 'Accept Offer'}
        </button>
      )}
      {(showCancelButton && onCancel && status === 'OPEN' && !isPast) && (
         <button
          onClick={() => onCancel(offer.id)}
          disabled={cancelling}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
        >
           {cancelling ? (
             <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".4"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" transform="rotate(90 12 12)"/></svg>
           ) : 'Cancel Offer'}
        </button>
      )}
    </div>
  );
};
