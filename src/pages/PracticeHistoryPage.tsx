import { useUser } from '../contexts/UserContext';
import { usePractice } from '../contexts/PracticeContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Award, Clock, Dumbbell } from 'lucide-react';

const PracticeHistoryPage = () => {
  const { isParentMode, childName } = useUser();
  const { recentSessions, totalSessions, totalPoints } = usePractice();
  
  const formatMinutes = (seconds: number) => {
    return `${Math.floor(seconds / 60)} min`;
  };
  
  return (
    <div className="max-w-screen-lg mx-auto">
      <h1 
        className="text-2xl font-bold text-blue-900 mb-6" 
        style={!isParentMode ? { fontFamily: 'Comic Sans MS, cursive' } : {}}
      >
        {isParentMode ? `${childName}'s Practice History` : 'Your Practice History'}
      </h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-blue-100 rounded-lg p-4 flex items-center"
        >
          <div className="bg-blue-200 rounded-full p-3 mr-4">
            <CalendarIcon size={24} className="text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Total Sessions</p>
            <p className="text-2xl font-bold text-blue-900">{totalSessions}</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-orange-100 rounded-lg p-4 flex items-center"
        >
          <div className="bg-orange-200 rounded-full p-3 mr-4">
            <Award size={24} className="text-orange-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-800">Total Points Earned</p>
            <p className="text-2xl font-bold text-orange-900">{totalPoints}</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-green-100 rounded-lg p-4 flex items-center"
        >
          <div className="bg-green-200 rounded-full p-3 mr-4">
            <Clock size={24} className="text-green-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Practice Streak</p>
            <p className="text-2xl font-bold text-green-900">4 days</p>
          </div>
        </motion.div>
      </div>
      
      {/* Achievement badges */}
      {!isParentMode && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Your Achievements
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <motion.div 
              whileHover={{ rotate: 5 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                <Dumbbell size={32} className="text-white" />
              </div>
              <span className="text-xs text-center font-medium">1000+ Punches</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ rotate: 5 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <CalendarIcon size={32} className="text-white" />
              </div>
              <span className="text-xs text-center font-medium">20+ Sessions</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ rotate: 5 }}
              className="flex flex-col items-center opacity-50"
            >
              <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-2">
                <Award size={32} className="text-white" />
              </div>
              <span className="text-xs text-center font-medium">300+ Points</span>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Session list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            {isParentMode ? 'Practice Sessions' : 'Your Practices'}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punches
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Katas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSessions.map((session) => (
                    <motion.tr 
                      key={session.id}
                      whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(session.date), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatMinutes(session.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {session.punches}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {session.katas.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          +{session.pointsEarned}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHistoryPage;