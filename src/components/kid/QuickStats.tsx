import { usePractice } from '../../contexts/PracticeContext';
import { 
  Dumbbell, 
  Clock, 
  Trophy
} from 'lucide-react';

const QuickStats = () => {
  const { totalPunches, totalSessions, favoriteKata } = usePractice();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        Quick Stats
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 rounded-lg p-3 flex items-center">
          <div className="bg-blue-200 rounded-full p-2 mr-3">
            <Dumbbell size={24} className="text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-blue-700">Total Punches</p>
            <p className="text-xl font-bold text-blue-900">{totalPunches}</p>
          </div>
        </div>
        
        <div className="bg-blue-100 rounded-lg p-3 flex items-center">
          <div className="bg-blue-200 rounded-full p-2 mr-3">
            <Clock size={24} className="text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-blue-700">Total Sessions</p>
            <p className="text-xl font-bold text-blue-900">{totalSessions}</p>
          </div>
        </div>
        
        <div className="bg-blue-100 rounded-lg p-3 flex items-center">
          <div className="bg-blue-200 rounded-full p-2 mr-3">
            <Trophy size={24} className="text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-blue-700">Favorite Kata</p>
            <p className="text-lg font-bold text-blue-900">{favoriteKata}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;