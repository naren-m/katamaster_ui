import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePractice } from '../../contexts/PracticeContext';
import { useRewards } from '../../contexts/RewardsContext';
import PunchCounter from './PunchCounter';
import KickCounter from './KickCounter';
import KataLogger from './KataLogger';
import SessionTimer from './SessionTimer';
import MotivationalMessage from './MotivationalMessage';
import Confetti from 'react-confetti';
import { sampleData } from '../../data/sampleData';

const PracticeCard = () => {
  const { 
    currentPunches,
    currentKicks, 
    currentKatas, 
    sessionTimer, 
    isSessionActive,
    startSession, 
    endSession
  } = usePractice();
  
  const { updateRewardProgress } = useRewards();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  
  const handleStartPractice = () => {
    startSession();
  };
  
  const handleFinishPractice = () => {
    const points = endSession();
    setPointsEarned(points);
    updateRewardProgress(points);
    
    // Show congratulatory UI
    setShowConfetti(true);
    setShowCompleted(true);
    
    // Get random motivational message
    const messages = sampleData.motivationalMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  const handleResetView = () => {
    setShowCompleted(false);
  };

  if (showCompleted) {
    return (
      <div className="relative">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Practice Complete!
          </h2>
          
          <div className="text-center mb-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-5xl font-bold text-orange-500 mb-2"
            >
              +{pointsEarned}
            </motion.div>
            <p className="text-lg text-blue-900">Points Earned</p>
          </div>
          
          <MotivationalMessage message={motivationalMessage} />
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-800">Punches</p>
              <p className="text-xl font-bold text-blue-900">{currentPunches}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-800">Kicks</p>
              <p className="text-xl font-bold text-blue-900">{currentKicks}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-800">Katas</p>
              <p className="text-xl font-bold text-blue-900">{currentKatas.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg col-span-3">
              <p className="text-sm text-blue-800">Practice Time</p>
              <p className="text-xl font-bold text-blue-900">
                {Math.floor(sessionTimer / 60)}m {sessionTimer % 60}s
              </p>
            </div>
          </div>
          
          <button
            onClick={handleResetView}
            className="w-full mt-6 bg-green-500 text-white py-3 px-4 rounded-lg text-lg font-bold hover:bg-green-600 transition-colors shadow-md"
          >
            Start New Practice
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        Today's Practice
      </h2>
      
      {!isSessionActive ? (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 text-white py-4 px-8 rounded-lg text-xl font-bold hover:bg-orange-600 transition-colors shadow-md"
            onClick={handleStartPractice}
          >
            Start Practice
          </motion.button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Punch & Kick Counter</h3>
              <div className="space-y-4">
                <PunchCounter />
                <KickCounter />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Kata Practice</h3>
              <KataLogger />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Practice Timer</h3>
            <SessionTimer seconds={sessionTimer} />
          </div>
          
          <button
            onClick={handleFinishPractice}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg text-lg font-bold hover:bg-green-600 transition-colors shadow-md"
          >
            Finish Practice
          </button>
        </>
      )}
    </div>
  );
};

export default PracticeCard;