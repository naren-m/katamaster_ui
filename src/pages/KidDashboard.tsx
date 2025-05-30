import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import PracticeCard from '../components/kid/PracticeCard';
import ProgressSection from '../components/kid/ProgressSection';
import RewardsSection from '../components/kid/RewardsSection';
import QuickStats from '../components/kid/QuickStats';

const KidDashboard = () => {
  const { childName } = useUser();
  
  useEffect(() => {
    document.title = `${childName}'s Karate Practice`;
  }, [childName]);

  return (
    <div className="max-w-screen-lg mx-auto">
      <h1 
        className="text-3xl font-bold text-blue-900 mb-6" 
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        Hi, {childName}! 🥋
      </h1>
      
      <div className="space-y-6">
        <PracticeCard />
        <ProgressSection />
        <RewardsSection />
        <QuickStats />
      </div>
    </div>
  );
};

export default KidDashboard;