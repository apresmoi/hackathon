
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MatchOffer } from '../types';
import * as matchOfferService from '../services/matchOfferService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MatchOfferCard } from '../components/cards/MatchOfferCard';
import { Link } from 'react-router-dom';

const MyOffersPage: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<MatchOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOfferId, setCancellingOfferId] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const myOffers = await matchOfferService.getMyOffers(user.id);
      setOffers(myOffers);
    } catch (err: any) {
      setError(err.message || 'Failed to load your match offers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleCancelOffer = async (offerId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to cancel this offer? This cannot be undone.")) {
        return;
    }
    setCancellingOfferId(offerId);
    setError('');
    try {
        await matchOfferService.cancelOfferByCreator(offerId, user.id);
        alert("Offer cancelled successfully.");
        fetchOffers(); // Refresh the list
    } catch (err: any) {
        setError(err.message || "Failed to cancel offer.");
        alert(err.message || "Failed to cancel offer. It might have been accepted already or an error occurred.");
    } finally {
        setCancellingOfferId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your offers..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">My Match Offers</h2>
        <Link to="/create-offer" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            + Create New Offer
        </Link>
      </div>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}

      {offers.length === 0 ? (
        <div className="text-center py-10 bg-white p-8 rounded-lg shadow">
          <img src="https://picsum.photos/seed/emptybox/150/150" alt="Empty" className="mx-auto mb-4 rounded-full" />
          <p className="text-gray-600 text-xl">You haven't created any match offers yet.</p>
          <Link to="/create-offer" className="mt-4 inline-block text-blue-500 hover:underline font-semibold">
            Create your first offer now!
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => (
            <MatchOfferCard
              key={offer.id}
              offer={offer}
              showAcceptButton={false} // Not for own offers
              showCancelButton={offer.status === 'OPEN'}
              onCancel={() => handleCancelOffer(offer.id)}
              cancelling={cancellingOfferId === offer.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOffersPage;
