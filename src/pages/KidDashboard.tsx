import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useMovement } from '../contexts/MovementContext';
import PracticeCard from '../components/kid/PracticeCard';
import ProgressSection from '../components/kid/ProgressSection';
import RewardsSection from '../components/kid/RewardsSection';
import QuickStats from '../components/kid/QuickStats';
import { DashboardAnalytics } from '../components/shared/DashboardAnalytics';

const KidDashboard = () => {
  const { childName, user } = useUser();
  const { savedCombinations, loading, error } = useMovement();
  
  console.log('🏠 KidDashboard - User state:', { 
    childName, 
    userId: user?.id,
    userObject: user 
  });
  console.log('🏠 KidDashboard - MovementContext state:', { 
    combinations: savedCombinations.length, 
    loading, 
    error 
  });
  
  useEffect(() => {
    document.title = `${childName}'s Karate Practice`;
  }, [childName]);

  return (
    <div className="max-w-screen-lg mx-auto">
      <h1 
        className="text-3xl font-bold text-karate-blue mb-6 font-comic" 
      >
        Hi, {childName}! 🥋
      </h1>
      
      <div className="space-y-6">
        <PracticeCard />
        <ProgressSection />
        <DashboardAnalytics />
        <RewardsSection />
        <QuickStats />
      </div>
    </div>
  );
};

export default KidDashboard;