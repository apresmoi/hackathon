
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      // Consider navigating to MyTeamPage to prompt team creation
      navigate('/my-team'); 
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Your Account</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            placeholder="Minimum 6 characters"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            placeholder="Re-enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
        >
           {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Register'}
        </button>
      </form>
      <p className="text-center text-gray-600 mt-6">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
