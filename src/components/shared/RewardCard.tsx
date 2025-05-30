import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRewards } from '../../contexts/RewardsContext';
import { useUser } from '../../contexts/UserContext';
import { usePractice } from '../../contexts/PracticeContext';
import { Gift, Lock, Check, X } from 'lucide-react';

type RewardCardProps = {
  id: number;
  name: string;
  points: number;
  earned: boolean;
  approved: boolean;
  icon: string;
  progress?: number;
};

const RewardCard = ({ id, name, points, earned, approved, icon, progress = 0 }: RewardCardProps) => {
  const { isParentMode } = useUser();
  const { totalPoints } = usePractice();
  const { requestRewardApproval, approveReward, denyReward } = useRewards();
  const [isRequesting, setIsRequesting] = useState(false);
  
  const handleRequestApproval = () => {
    setIsRequesting(true);
    setTimeout(() => {
      requestRewardApproval(id);
      setIsRequesting(false);
    }, 1000);
  };
  
  const handleApprove = () => {
    approveReward(id);
  };
  
  const handleDeny = () => {
    denyReward(id);
  };
  
  const canEarn = totalPoints >= points && !earned;
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden ${
        approved ? 'border-4 border-green-500' : earned ? 'border-4 border-yellow-500' : ''
      }`}
    >
      <div className={`h-24 flex items-center justify-center ${
        earned ? 'bg-yellow-400' : 'bg-blue-600'
      }`}>
        <Gift size={48} className="text-white" />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-blue-900 mb-1">{name}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-orange-500">{points} points</span>
          {!earned && (
            <div className="flex items-center">
              <Lock size={14} className="text-gray-400 mr-1" />
              <span className="text-xs text-gray-500">Locked</span>
            </div>
          )}
          {earned && approved && (
            <div className="flex items-center">
              <Check size={14} className="text-green-600 mr-1" />
              <span className="text-xs text-green-600">Approved</span>
            </div>
          )}
          {earned && !approved && (
            <div className="flex items-center">
              <span className="text-xs text-yellow-600">Pending</span>
            </div>
          )}
        </div>
        
        {!earned && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div 
                className="bg-orange-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="text-xs text-right text-gray-500">
              {Math.round(progress * 100)}%
            </div>
          </>
        )}
        
        {!isParentMode && (
          <div className="mt-3">
            {earned && !approved && (
              <button
                className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isRequesting}
              >
                {isRequesting ? 'Requested!' : 'Waiting for Parent'}
              </button>
            )}
            {earned && approved && (
              <div className="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-bold text-sm text-center">
                Ready to Use!
              </div>
            )}
            {canEarn && (
              <button
                onClick={handleRequestApproval}
                className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors"
              >
                Get Reward
              </button>
            )}
            {!earned && !canEarn && (
              <div className="w-full py-2 px-4 bg-gray-300 text-gray-600 rounded-lg font-bold text-sm text-center">
                Keep Practicing!
              </div>
            )}
          </div>
        )}
        
        {isParentMode && earned && !approved && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleApprove}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Check size={16} className="mr-1" />
              Approve
            </button>
            <button
              onClick={handleDeny}
              className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <X size={16} className="mr-1" />
              Deny
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RewardCard;