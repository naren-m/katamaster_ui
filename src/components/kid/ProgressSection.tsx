import { motion } from 'framer-motion';
import { usePractice } from '../../contexts/PracticeContext';
import { Award, Flame } from 'lucide-react';

const ProgressSection = () => {
  const { totalPoints, currentStreak } = usePractice();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        Your Progress
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-blue-100 rounded-xl p-4 flex flex-col items-center justify-center"
        >
          <Award size={36} className="text-orange-500 mb-2" />
          <span className="text-sm text-blue-800">Total Points</span>
          <motion.span 
            className="text-2xl font-bold text-blue-900"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            key={totalPoints}
          >
            {totalPoints}
          </motion.span>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-orange-100 rounded-xl p-4 flex flex-col items-center justify-center"
        >
          <Flame size={36} className="text-orange-500 mb-2" />
          <span className="text-sm text-blue-800">Practice Streak</span>
          <motion.span 
            className="text-2xl font-bold text-blue-900"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            key={currentStreak}
          >
            {currentStreak} days
          </motion.span>
        </motion.div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-blue-800">Next Belt Level</span>
          <span className="text-sm font-medium text-blue-800">500 pts</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <motion.div 
            className="bg-orange-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalPoints / 500) * 100, 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="text-xs text-right mt-1 text-blue-700">
          {totalPoints} / 500 points
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;