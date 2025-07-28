import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePractice } from '../../contexts/PracticeContext';

const KataLogger = () => {
  const { currentKatas, addKata, kataList, kataObjects } = usePractice();
  const navigate = useNavigate();
  const [selectedKata, setSelectedKata] = useState(kataList[0] || 'Heian Shodan');
  const [repetitions, setRepetitions] = useState(1);

  // Update selectedKata when kataList changes
  useEffect(() => {
    if (kataList.length > 0 && !kataList.includes(selectedKata)) {
      setSelectedKata(kataList[0]);
    }
  }, [kataList, selectedKata]);

  const handleAddKata = () => {
    addKata(selectedKata, repetitions);
    // Reset repetitions after adding
    setRepetitions(1);
  };

  const incrementReps = () => {
    setRepetitions(prev => prev + 1);
  };

  const decrementReps = () => {
    setRepetitions(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleViewKataDetails = () => {
    const selectedKataObject = kataObjects.find(kata => kata.name === selectedKata);
    if (selectedKataObject) {
      navigate(`/kata/${selectedKataObject.id}`);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <select
          className="w-full p-3 border-2 border-karate-blueLight rounded-xl text-lg focus:border-karate-blue focus:ring focus:ring-karate-lightBlue focus:ring-opacity-50 font-comic bg-white shadow-md"
          value={selectedKata}
          onChange={(e) => setSelectedKata(e.target.value)}
        >
          {kataList.length > 0 ? (
            kataList.map((kata, index) => (
              <option key={`kata-option-${index}`} value={kata}>
                🥋 {kata}
              </option>
            ))
          ) : (
            <option value="Heian Shodan">🥋 Heian Shodan</option>
          )}
        </select>
      </div>

      <div className="flex items-center justify-center mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-karate-orange rounded-full flex items-center justify-center text-white shadow-lg border-2 border-karate-orangeLight"
          onClick={decrementReps}
        >
          <span className="text-xl font-bold">-</span>
        </motion.button>
        
        <div className="mx-4 text-2xl font-bold text-karate-blue font-comic">
          {repetitions} {repetitions === 1 ? 'time' : 'times'} 🔢
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-karate-orange rounded-full flex items-center justify-center text-white shadow-lg border-2 border-karate-orangeLight"
          onClick={incrementReps}
        >
          <span className="text-xl font-bold">+</span>
        </motion.button>
      </div>

      <div className="space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-karate-blue text-white py-3 px-4 rounded-xl font-bold hover:bg-karate-blueDark transition-colors shadow-lg border-2 border-karate-blueLight font-comic"
          onClick={handleAddKata}
        >
          🥋 Add Kata
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-karate-green text-white py-2 px-4 rounded-xl font-medium hover:bg-karate-greenDark transition-colors shadow-lg border-2 border-karate-greenLight font-comic"
          onClick={handleViewKataDetails}
        >
          📖 View Steps & Details
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-karate-orange to-karate-blue text-white py-2 px-4 rounded-xl font-medium hover:from-karate-orangeDark hover:to-karate-blueDark transition-colors shadow-lg border-2 border-white font-comic"
          onClick={() => navigate('/kata-reference')}
        >
          📚 Browse All Kata
        </motion.button>
      </div>

      {currentKatas.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 text-karate-blue font-comic">Today's Katas: 🎯</h4>
          <ul className="bg-karate-lightBlue rounded-xl p-3 border-2 border-karate-blueLight">
            {currentKatas.map((kata, index) => (
              <motion.li
                key={`current-kata-${kata.name}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-2 border-b border-karate-blueLight last:border-0 text-karate-darkText font-comic"
              >
                🥋 {kata.name} x{kata.repetitions}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KataLogger;