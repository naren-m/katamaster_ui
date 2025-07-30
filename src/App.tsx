import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { PracticeProvider } from './contexts/PracticeContext';
import { RewardsProvider } from './contexts/RewardsContext';
import { MovementProvider } from './contexts/MovementContext';
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
import MovementTrackerPage from './pages/MovementTrackerPage';
import DashboardPage from './pages/DashboardPage';
import VideoPracticePage from './pages/VideoPracticePage';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('App state:', { isAuthenticated, loading, hasUser: !!user });

  if (loading) {
    console.log('App showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-karate-blue via-karate-blueLight to-karate-orange flex items-center justify-center">
        <div className="text-white text-xl font-comic">Loading KataMaster... 🥋</div>
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
          <MovementProvider>
            <Layout>
            <Routes>
              <Route path="/" element={<KidDashboard />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/history" element={<PracticeHistoryPage />} />
              <Route path="/calendar" element={<PointsCalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/kata/:kataId" element={<KataDetailPage />} />
              <Route path="/kata" element={<KataReferencePage />} />
              <Route path="/kata-reference" element={<KataReferencePage />} />
              <Route path="/movement-tracker" element={<MovementTrackerPage />} />
              <Route path="/video-practice" element={<VideoPracticePage />} />
            </Routes>
            </Layout>
          </MovementProvider>
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