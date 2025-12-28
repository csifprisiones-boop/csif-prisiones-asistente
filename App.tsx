import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './screens/HomePage';
import AlertPage from './screens/AlertPage';
import NewsPage from './screens/NewsPage';
import ShiftsPage from './screens/ShiftsPage';
import DocumentsPage from './screens/DocumentsPage';
import ProfilePage from './screens/ProfilePage';
import ChatPage from './screens/ChatPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginScreen } from './screens/LoginScreen';
import UserSettingsPage from './screens/UserSettingsPage';
import { logInteraction } from './services/tracking';

import LandingPage from './screens/LandingPage';

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    logInteraction('navigation', { path: location.pathname });
  }, [location]);
  return null;
};

const ProtectedApp = () => {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = React.useState(true);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  // If we want the landing page to be seen even if logged in (as a sales page), 
  // we can use a separate route or a state. 
  // The user said "antes de iniciar la app".

  return (
    <HashRouter>
      <ThemeToggle />
      <RouteTracker />
      <Routes>
        {/* Landing always available at root */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth required routes */}
        <Route path="/home" element={user ? <HomePage /> : <LoginScreen />} />
        <Route path="/alert" element={user ? <AlertPage /> : <LoginScreen />} />
        <Route path="/news" element={user ? <NewsPage /> : <LoginScreen />} />
        <Route path="/shifts" element={user ? <ShiftsPage /> : <LoginScreen />} />
        <Route path="/documents" element={user ? <DocumentsPage /> : <LoginScreen />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <LoginScreen />} />
        <Route path="/settings" element={user ? <UserSettingsPage /> : <LoginScreen />} />
        <Route path="/chat" element={user ? <ChatPage /> : <LoginScreen />} />

        {/* Login fallback */}
        <Route path="/login" element={user ? <HomePage /> : <LoginScreen />} />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
};

export default App;