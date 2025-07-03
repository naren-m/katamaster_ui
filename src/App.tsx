import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { PracticeProvider } from './contexts/PracticeContext';
import { RewardsProvider } from './contexts/RewardsContext';
import Layout from './components/shared/Layout';
import KidDashboard from './pages/KidDashboard';
import ParentDashboard from './pages/ParentDashboard';
import RewardsPage from './pages/RewardsPage';
import PracticeHistoryPage from './pages/PracticeHistoryPage';
import SettingsPage from './pages/SettingsPage';
import { PointsCalendarPage } from './pages/PointsCalendarPage';
import { SignInPage } from './pages/SignInPage';
import { KataDetailPage } from './pages/KataDetailPage';
import KataReferencePage from './pages/KataReferencePage';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('App state:', { isAuthenticated, loading, hasUser: !!user });

  if (loading) {
    console.log('App showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('App showing sign-in page');
    return <SignInPage />;
  }

  console.log('App showing main dashboard');

  return (
    <UserProvider>
      <PracticeProvider>
        <RewardsProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<KidDashboard />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/history" element={<PracticeHistoryPage />} />
              <Route path="/calendar" element={<PointsCalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/kata/:kataId" element={<KataDetailPage />} />
              <Route path="/kata-reference" element={<KataReferencePage />} />
            </Routes>
          </Layout>
        </RewardsProvider>
      </PracticeProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;