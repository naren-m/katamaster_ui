import { createContext, useState, useContext, ReactNode } from 'react';

type Reward = {
  id: number;
  name: string;
  points: number;
  earned: boolean;
  approved: boolean;
  icon: string;
  progress?: number;
};

type RewardsContextType = {
  rewards: Reward[];
  pendingRewards: Reward[];
  approvedRewards: Reward[];
  unearnedRewards: Reward[];
  requestRewardApproval: (rewardId: number) => void;
  approveReward: (rewardId: number) => void;
  denyReward: (rewardId: number) => void;
  addCustomReward: (reward: Omit<Reward, 'id' | 'earned' | 'approved'>) => void;
  updateRewardProgress: (points: number) => void;
};

// Authentic karate-themed rewards system
const DEFAULT_REWARDS: Reward[] = [
  { id: 1, name: "Ice Cream", points: 50, earned: false, approved: false, icon: "ice-cream" },
  { id: 2, name: "Pizza Night", points: 150, earned: false, approved: false, icon: "pizza" },
  { id: 3, name: "Movie Night", points: 200, earned: false, approved: false, icon: "film" },
  { id: 4, name: "New Toy", points: 100, earned: false, approved: false, icon: "toy" },
  { id: 5, name: "Special Activity", points: 120, earned: false, approved: false, icon: "activity" },
  { id: 6, name: "Extra Screen Time", points: 75, earned: false, approved: false, icon: "screen" },
  { id: 7, name: "Stay Up Late", points: 180, earned: false, approved: false, icon: "moon" }
];

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const RewardsProvider = ({ children }: { children: ReactNode }) => {
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);

  const pendingRewards = rewards.filter(r => r.earned && !r.approved);
  const approvedRewards = rewards.filter(r => r.earned && r.approved);
  const unearnedRewards = rewards.filter(r => !r.earned);

  const requestRewardApproval = (rewardId: number) => {
    setRewards(prev => 
      prev.map(reward => 
        reward.id === rewardId && reward.earned 
          ? { ...reward, approved: false } 
          : reward
      )
    );
  };

  const approveReward = (rewardId: number) => {
    setRewards(prev => 
      prev.map(reward => 
        reward.id === rewardId 
          ? { ...reward, approved: true } 
          : reward
      )
    );
  };

  const denyReward = (rewardId: number) => {
    setRewards(prev => 
      prev.map(reward => 
        reward.id === rewardId 
          ? { ...reward, earned: false, approved: false, progress: 0 } 
          : reward
      )
    );
  };

  const addCustomReward = (reward: Omit<Reward, 'id' | 'earned' | 'approved'>) => {
    const newReward: Reward = {
      ...reward,
      id: Date.now(),
      earned: false,
      approved: false,
      progress: 0
    };
    setRewards(prev => [...prev, newReward]);
  };

  const updateRewardProgress = (points: number) => {
    setRewards(prev => 
      prev.map(reward => {
        if (reward.earned) return reward;
        
        // Calculate new progress
        const currentProgress = reward.progress || 0;
        const newProgress = Math.min(currentProgress + (points / reward.points), 1);
        
        // Check if reward is now earned
        if (newProgress >= 1) {
          return { ...reward, earned: true, progress: 1 };
        }
        
        return { ...reward, progress: newProgress };
      })
    );
  };

  return (
    <RewardsContext.Provider value={{
      rewards,
      pendingRewards,
      approvedRewards,
      unearnedRewards,
      requestRewardApproval,
      approveReward,
      denyReward,
      addCustomReward,
      updateRewardProgress
    }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};