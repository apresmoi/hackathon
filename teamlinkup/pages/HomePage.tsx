
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="text-center py-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-xl p-8">
      <img src="https://picsum.photos/seed/sportsmatch/300/200" alt="Amateur Sports" className="mx-auto rounded-lg mb-6 shadow-md" />
      <h1 className="text-5xl font-bold mb-6">Welcome to {APP_NAME}!</h1>
      <p className="text-xl mb-8 max-w-2xl mx-auto">
        The ultimate platform for amateur sports teams to connect, schedule matches, and fuel their competitive spirit.
        Register your team, create match offers, or find opponents for Football, Basketball, Volleyball, and Padel.
      </p>
      {user ? (
        <Link
          to="/dashboard"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition-transform transform hover:scale-105"
        >
          Go to Your Dashboard
        </Link>
      ) : (
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition-transform transform hover:scale-105"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-400 hover:bg-green-500 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition-transform transform hover:scale-105"
          >
            Register Your Team
          </Link>
        </div>
      )}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2 text-indigo-600">Register Easily</h3>
          <p>Sign up as an Inscriber and set up your team in minutes.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2 text-indigo-600">Create Offers</h3>
          <p>Define match details, venue, and availability for others to find.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2 text-indigo-600">Find Matches</h3>
          <p>Search for opponents based on sport, skill, and location.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2 text-indigo-600">Get Notified</h3>
          <p>Receive email updates for confirmations, reminders, and cancellations.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
