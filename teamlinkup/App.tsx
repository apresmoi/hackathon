
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyTeamPage from './pages/MyTeamPage';
import CreateOfferPage from './pages/CreateOfferPage';
import MyOffersPage from './pages/MyOffersPage';
import SearchOffersPage from './pages/SearchOffersPage';
import ConfirmedMatchesPage from './pages/ConfirmedMatchesPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthGuard from './components/AuthGuard';
import { useAuth } from './hooks/useAuth';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            
            <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
            <Route path="/my-team" element={<AuthGuard><MyTeamPage /></AuthGuard>} />
            <Route path="/create-offer" element={<AuthGuard><CreateOfferPage /></AuthGuard>} />
            <Route path="/my-offers" element={<AuthGuard><MyOffersPage /></AuthGuard>} />
            <Route path="/search-offers" element={<AuthGuard><SearchOffersPage /></AuthGuard>} />
            <Route path="/confirmed-matches" element={<AuthGuard><ConfirmedMatchesPage /></AuthGuard>} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
