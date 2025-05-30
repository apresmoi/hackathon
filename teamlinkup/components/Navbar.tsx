
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold hover:text-slate-300 transition-colors">
          {APP_NAME}
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
              <Link to="/my-team" className="hover:text-slate-300 transition-colors">My Team</Link>
              <Link to="/create-offer" className="hover:text-slate-300 transition-colors">Create Offer</Link>
              <Link to="/my-offers" className="hover:text-slate-300 transition-colors">My Offers</Link>
              <Link to="/search-offers" className="hover:text-slate-300 transition-colors">Search Offers</Link>
              <Link to="/confirmed-matches" className="hover:text-slate-300 transition-colors">Confirmed Matches</Link>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition-colors"
              >
                Logout ({user.email})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-slate-300 transition-colors">Login</Link>
              <Link to="/register" className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
