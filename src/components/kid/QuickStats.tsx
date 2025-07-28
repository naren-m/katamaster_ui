import { usePractice } from '../../contexts/PracticeContext';
import { 
  Dumbbell, 
  Clock, 
  Trophy
} from 'lucide-react';

const QuickStats = () => {
  const { totalPunches, totalSessions, favoriteKata } = usePractice();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-karate-lightBlue">
      <h2 className="text-2xl font-bold mb-4 text-karate-blue font-comic">
        Quick Stats 📊
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-karate-lightOrange rounded-xl p-4 flex items-center border-2 border-karate-orangeLight">
          <div className="bg-karate-orange rounded-full p-3 mr-3 shadow-md">
            <Dumbbell size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-karate-darkText font-comic">Total Punches 👊</p>
            <p className="text-2xl font-bold text-karate-orange font-comic">{totalPunches}</p>
          </div>
        </div>
        
        <div className="bg-karate-lightBlue rounded-xl p-4 flex items-center border-2 border-karate-blueLight">
          <div className="bg-karate-blue rounded-full p-3 mr-3 shadow-md">
            <Clock size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-karate-darkText font-comic">Total Sessions ⏱️</p>
            <p className="text-2xl font-bold text-karate-blue font-comic">{totalSessions}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-karate-lightOrange to-karate-lightBlue rounded-xl p-4 flex items-center border-2 border-karate-greenLight">
          <div className="bg-karate-green rounded-full p-3 mr-3 shadow-md">
            <Trophy size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-karate-darkText font-comic">Favorite Kata 🏆</p>
            <p className="text-lg font-bold text-karate-green font-comic">{favoriteKata}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;