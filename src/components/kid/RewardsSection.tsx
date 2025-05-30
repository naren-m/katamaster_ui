import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRewards } from '../../contexts/RewardsContext';
import { Gift, ChevronRight } from 'lucide-react';

const RewardsSection = () => {
  const { pendingRewards, approvedRewards } = useRewards();
  const navigate = useNavigate();
  
  const getIconComponent = (iconName: string) => {
    return <Gift size={24} className="text-orange-500" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        Your Rewards
      </h2>
      
      {(approvedRewards.length > 0 || pendingRewards.length > 0) ? (
        <div className="space-y-4">
          {approvedRewards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-600">Ready to Use</h3>
              {approvedRewards.map((reward) => (
                <motion.div 
                  key={reward.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-green-100 rounded-lg p-3 mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getIconComponent(reward.icon)}
                    </div>
                    <div>
                      <p className="font-bold text-green-800">{reward.name}</p>
                      <p className="text-xs text-green-600">{reward.points} points</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold text-xs uppercase">Approved!</span>
                </motion.div>
              ))}
            </div>
          )}
          
          {pendingRewards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-600">Waiting for Approval</h3>
              {pendingRewards.map((reward) => (
                <motion.div 
                  key={reward.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-yellow-100 rounded-lg p-3 mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getIconComponent(reward.icon)}
                    </div>
                    <div>
                      <p className="font-bold text-yellow-800">{reward.name}</p>
                      <p className="text-xs text-yellow-600">{reward.points} points</p>
                    </div>
                  </div>
                  <span className="text-yellow-600 text-xs">Waiting...</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Gift size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No rewards yet</p>
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/rewards')}
        className="w-full mt-4 py-3 bg-orange-500 text-white rounded-lg font-bold flex items-center justify-center hover:bg-orange-600 transition-colors"
      >
        See All Rewards
        <ChevronRight size={20} className="ml-1" />
      </motion.button>
    </div>
  );
};

export default RewardsSection;