import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePractice } from '../../contexts/PracticeContext';

const KataLogger = () => {
  const { currentKatas, addKata, kataList } = usePractice();
  const [selectedKata, setSelectedKata] = useState(kataList[0]);
  const [repetitions, setRepetitions] = useState(1);

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

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <select
          className="w-full p-3 border-2 border-blue-200 rounded-lg text-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          value={selectedKata}
          onChange={(e) => setSelectedKata(e.target.value)}
        >
          {kataList.map((kata) => (
            <option key={kata} value={kata}>
              {kata}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-center mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md"
          onClick={decrementReps}
        >
          <span className="text-xl font-bold">-</span>
        </motion.button>
        
        <div className="mx-4 text-2xl font-bold text-blue-800">
          {repetitions} {repetitions === 1 ? 'time' : 'times'}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md"
          onClick={incrementReps}
        >
          <span className="text-xl font-bold">+</span>
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
        onClick={handleAddKata}
      >
        Add Kata
      </motion.button>

      {currentKatas.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 text-blue-800">Today's Katas:</h4>
          <ul className="bg-blue-50 rounded-lg p-2">
            {currentKatas.map((kata, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-1 border-b border-blue-100 last:border-0"
              >
                {kata.name} x{kata.repetitions}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KataLogger;