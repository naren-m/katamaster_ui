import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePractice } from '../contexts/PracticeContext';
import { useRewards } from '../contexts/RewardsContext';
import { format } from 'date-fns';
import { 
  BarChart, 
  Calendar, 
  Award, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ParentDashboard = () => {
  const { childName } = useUser();
  const { totalPoints, totalSessions, totalPunches, recentSessions } = usePractice();
  const { pendingRewards } = useRewards();
  
  useEffect(() => {
    document.title = `Parent Dashboard - ${childName}'s Karate Practice`;
  }, [childName]);

  return (
    <div className="max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        {childName}'s Karate Practice - Parent Dashboard
      </h1>
      
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Award size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Points</p>
            <p className="text-2xl font-bold text-blue-900">{totalPoints}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Calendar size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Practice Sessions</p>
            <p className="text-2xl font-bold text-blue-900">{totalSessions}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <BarChart size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Punches</p>
            <p className="text-2xl font-bold text-blue-900">{totalPunches}</p>
          </div>
        </div>
      </div>
      
      {/* Pending rewards approval */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Pending Reward Approvals</h2>
          <a href="/rewards" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View All <ChevronRight size={16} />
          </a>
        </div>
        
        {pendingRewards.length > 0 ? (
          <div className="space-y-3">
            {pendingRewards.map((reward) => (
              <div key={reward.id} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{reward.name}</p>
                  <p className="text-sm text-gray-600">{reward.points} points</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                    <CheckCircle2 size={20} />
                  </button>
                  <button className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200">
                    <AlertCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No pending reward approvals
          </div>
        )}
      </div>
      
      {/* Recent practice sessions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Recent Practice Sessions</h2>
          <a href="/history" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View All <ChevronRight size={16} />
          </a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punches</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {format(new Date(session.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-blue-500" />
                      {session.duration} min
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {session.punches}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {session.katas.join(', ')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    +{session.pointsEarned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;