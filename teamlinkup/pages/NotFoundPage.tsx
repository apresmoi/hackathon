
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <img src="https://picsum.photos/seed/404error/300/200" alt="Lost Ball" className="mx-auto mb-8 rounded-lg shadow-md" />
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Oops! Page Not Found.</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        It seems like the page you're looking for has taken a detour or doesn't exist. 
        Let's get you back on track.
      </p>
      <Link
        to="/"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition-transform transform hover:scale-105"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
