import { motion } from 'framer-motion';
import { usePractice } from '../../contexts/PracticeContext';

const KickCounter = () => {
  const { currentKicks, incrementKicks } = usePractice();

  const handleKickIncrement = () => {
    incrementKicks();
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="text-4xl font-bold mb-4 text-orange-500"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3 }}
        key={currentKicks}
      >
        {currentKicks}
      </motion.div>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
        onClick={handleKickIncrement}
      >
        <span className="text-2xl font-bold">KICK</span>
      </motion.button>
    </div>
  );
};

export default KickCounter;