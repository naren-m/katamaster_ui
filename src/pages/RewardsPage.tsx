import { useUser } from '../contexts/UserContext';
import { useRewards } from '../contexts/RewardsContext';
import { usePractice } from '../contexts/PracticeContext';
import RewardCard from '../components/shared/RewardCard';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const RewardsPage = () => {
  const { isParentMode, childName } = useUser();
  const { rewards, addCustomReward } = useRewards();
  const { totalPoints } = usePractice();
  
  const [showAddReward, setShowAddReward] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState(50);
  
  const handleAddReward = () => {
    if (newRewardName.trim() && newRewardPoints > 0) {
      addCustomReward({
        name: newRewardName,
        points: newRewardPoints,
        icon: 'gift'
      });
      setNewRewardName('');
      setNewRewardPoints(50);
      setShowAddReward(false);
    }
  };
  
  // Get earned rewards
  const earnedRewards = rewards.filter(r => r.earned);
  // Get uneearned rewards
  const unearnedRewards = rewards.filter(r => !r.earned);

  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold text-blue-900" 
          style={!isParentMode ? { fontFamily: 'Comic Sans MS, cursive' } : {}}
        >
          {isParentMode ? `${childName}'s Rewards` : 'Your Rewards'}
        </h1>
        
        {isParentMode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
            onClick={() => setShowAddReward(!showAddReward)}
          >
            <Plus size={18} className="mr-1" />
            Add Reward
          </motion.button>
        )}
      </div>
      
      {isParentMode && showAddReward && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Add New Reward</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Name
              </label>
              <input
                type="text"
                value={newRewardName}
                onChange={(e) => setNewRewardName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Ice Cream Treat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points Required
              </label>
              <input
                type="number"
                value={newRewardPoints}
                onChange={(e) => setNewRewardPoints(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddReward(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReward}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!newRewardName.trim() || newRewardPoints <= 0}
              >
                Add Reward
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isParentMode && (
        <div className="bg-orange-100 rounded-lg p-4 mb-6 flex items-center">
          <div className="bg-orange-200 rounded-full p-2 mr-3">
            <span className="text-xl font-bold text-orange-600">🏆</span>
          </div>
          <div>
            <p className="text-orange-800">You have <span className="font-bold">{totalPoints} points</span> to spend on rewards!</p>
          </div>
        </div>
      )}
      
      {earnedRewards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            {isParentMode ? 'Earned Rewards' : 'Your Earned Rewards'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {earnedRewards.map((reward) => (
              <RewardCard key={reward.id} {...reward} />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          {isParentMode ? 'Available Rewards' : 'Rewards to Earn'}
        </h2>
        
        {unearnedRewards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unearnedRewards.map((reward) => (
              <RewardCard key={reward.id} {...reward} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No rewards available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;