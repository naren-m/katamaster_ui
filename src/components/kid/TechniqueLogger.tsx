import { useState } from 'react';
import { motion } from 'framer-motion';
import { TECHNIQUE_CATEGORIES, TECHNIQUES, TechniqueCategory, Technique } from '../../types/techniques';
import { usePractice } from '../../contexts/PracticeContext';

const TechniqueLogger = () => {
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory>('punch');
  const { incrementTechnique, getTechniqueCount } = usePractice();
  
  const techniques = TECHNIQUES.filter(t => t.category === selectedCategory);
  
  const handleIncrement = (technique: Technique) => {
    incrementTechnique(technique.id);
  };
  
  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {TECHNIQUE_CATEGORIES.map(category => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </motion.button>
        ))}
      </div>
      
      {/* Technique Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {techniques.map(technique => (
          <motion.div
            key={technique.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-blue-900">{technique.name}</h3>
                <p className="text-sm text-gray-600 italic">{technique.japaneseName}</p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                {technique.points} pts
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-2xl font-bold text-blue-900">
                {getTechniqueCount(technique.id)}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleIncrement(technique)}
                className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md hover:bg-orange-600 transition-colors"
              >
                +
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TechniqueLogger;