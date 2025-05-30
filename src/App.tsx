import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { PracticeProvider } from './contexts/PracticeContext';
import { RewardsProvider } from './contexts/RewardsContext';
import Layout from './components/shared/Layout';
import KidDashboard from './pages/KidDashboard';
import ParentDashboard from './pages/ParentDashboard';
import RewardsPage from './pages/RewardsPage';
import PracticeHistoryPage from './pages/PracticeHistoryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <UserProvider>
        <PracticeProvider>
          <RewardsProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<KidDashboard />} />
                <Route path="/parent" element={<ParentDashboard />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/history" element={<PracticeHistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </RewardsProvider>
        </PracticeProvider>
      </UserProvider>
    </Router>
  );
}

export default App;