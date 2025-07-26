import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalKatasPracticed: number;
  totalSessions: number;
  totalRepetitions: number;
  totalPracticeMinutes: number;
  averageRating: number;
  currentStreak: number;
  totalPoints: number;
  masteredKatas: number;
  favoriteKata: string;
  lastPracticeDate: string;
}

interface KataProgressSummary {
  kataId: string;
  kataName: string;
  totalRepetitions: number;
  masteryPercentage: number;
  mastered: boolean;
  lastPracticed: string;
}

interface RecentActivity {
  id: string;
  type: 'kata_practice' | 'achievement' | 'milestone';
  activityName: string;
  description: string;
  timestamp: string;
  pointsEarned?: number;
  icon: string;
}

interface DashboardAnalyticsData {
  stats: DashboardStats;
  topKatas: KataProgressSummary[];
  recentActivity: RecentActivity[];
  progressTrend: Array<{ date: string; sessions: number; repetitions: number }>;
}

export const DashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'activity'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [analyticsData, recentActivityData] = await Promise.all([
        apiService.getDashboardAnalytics(user.id),
        apiService.getRecentActivity(user.id, 15)
      ]);

      if (analyticsData) {
        setAnalytics({
          stats: analyticsData.stats || getDefaultStats(),
          topKatas: analyticsData.topKatas || [],
          recentActivity: recentActivityData?.activities || [],
          progressTrend: analyticsData.progressTrend || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      // Set mock data for development/demo
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const getDefaultStats = (): DashboardStats => ({
    totalKatasPracticed: 0,
    totalSessions: 0,
    totalRepetitions: 0,
    totalPracticeMinutes: 0,
    averageRating: 0,
    currentStreak: 0,
    totalPoints: 0,
    masteredKatas: 0,
    favoriteKata: '',
    lastPracticeDate: ''
  });

  const getMockAnalytics = (): DashboardAnalyticsData => ({
    stats: {
      totalKatasPracticed: 8,
      totalSessions: 24,
      totalRepetitions: 156,
      totalPracticeMinutes: 720,
      averageRating: 7.8,
      currentStreak: 5,
      totalPoints: 1240,
      masteredKatas: 2,
      favoriteKata: 'Heian Shodan',
      lastPracticeDate: new Date().toISOString()
    },
    topKatas: [
      {
        kataId: '1',
        kataName: 'Heian Shodan',
        totalRepetitions: 45,
        masteryPercentage: 85,
        mastered: true,
        lastPracticed: new Date(Date.now() - 86400000).toISOString()
      },
      {
        kataId: '2', 
        kataName: 'Heian Nidan',
        totalRepetitions: 32,
        masteryPercentage: 64,
        mastered: false,
        lastPracticed: new Date(Date.now() - 172800000).toISOString()
      },
      {
        kataId: '3',
        kataName: 'Tekki Shodan',
        totalRepetitions: 28,
        masteryPercentage: 56,
        mastered: false,
        lastPracticed: new Date(Date.now() - 259200000).toISOString()
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'kata_practice',
        activityName: 'Heian Shodan Practice',
        description: 'Completed 8 repetitions with focus on timing',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        pointsEarned: 40,
        icon: '🥋'
      },
      {
        id: '2',
        type: 'achievement',
        activityName: 'Consistency Master',
        description: 'Practiced for 5 consecutive days',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        pointsEarned: 100,
        icon: '🏆'
      }
    ],
    progressTrend: [
      { date: '2024-01-20', sessions: 2, repetitions: 15 },
      { date: '2024-01-21', sessions: 1, repetitions: 8 },
      { date: '2024-01-22', sessions: 3, repetitions: 22 },
      { date: '2024-01-23', sessions: 2, repetitions: 18 },
      { date: '2024-01-24', sessions: 1, repetitions: 12 }
    ]
  });

  const getStatIcon = (statType: string) => {
    switch (statType) {
      case 'katas': return '📚';
      case 'sessions': return '🥋';
      case 'repetitions': return '🔄';
      case 'minutes': return '⏱️';
      case 'rating': return '⭐';
      case 'streak': return '🔥';
      case 'points': return '💎';
      case 'mastered': return '🏆';
      default: return '📊';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (!user) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">Sign in to view your dashboard analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="ml-3 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Unable to load analytics data</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-analytics">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Your karate training analytics and progress</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          data-testid="refresh-button"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['overview', 'progress', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-katas">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Katas Practiced</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.totalKatasPracticed}</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('katas')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-sessions"> 
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.totalSessions}</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('sessions')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-repetitions">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Repetitions</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.stats.totalRepetitions)}</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('repetitions')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-points">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(analytics.stats.totalPoints)}</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('points')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-streak">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.stats.currentStreak} days</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('streak')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-mastered">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mastered</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.stats.masteredKatas}</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('mastered')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-rating">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.stats.averageRating.toFixed(1)}</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('rating')}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid="stat-minutes">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Practice Time</p>
                    <p className="text-2xl font-bold text-blue-600">{Math.round(analytics.stats.totalPracticeMinutes / 60)}h</p>
                  </div>
                  <span className="text-2xl">{getStatIcon('minutes')}</span>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Quick Insights</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-100">Favorite Kata</p>
                  <p className="text-xl font-bold">{analytics.stats.favoriteKata || 'Not determined yet'}</p>
                </div>
                <div>
                  <p className="text-purple-100">Last Practice</p>
                  <p className="text-xl font-bold">{formatDate(analytics.stats.lastPracticeDate)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Top Practiced Katas</h3>
                <p className="text-gray-600">Your most practiced katas and progress levels</p>
              </div>
              <div className="p-6 space-y-4" data-testid="top-katas-list">
                {analytics.topKatas.map((kata, index) => (
                  <div key={kata.kataId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{kata.kataName}</h4>
                        {kata.mastered && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✅ Mastered
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{kata.totalRepetitions} reps</span>
                        <span>Last: {formatDate(kata.lastPracticed)}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Mastery Progress</span>
                          <span>{kata.masteryPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              kata.masteryPercentage >= 80 ? 'bg-green-500' :
                              kata.masteryPercentage >= 60 ? 'bg-blue-500' :
                              kata.masteryPercentage >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(kata.masteryPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {analytics.topKatas.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No practice data yet. Start practicing to see your progress!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-gray-600">Your latest training sessions and achievements</p>
              </div>
              <div className="p-6" data-testid="recent-activity-list">
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.activityName}</h4>
                          <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        {activity.pointsEarned && (
                          <div className="flex items-center mt-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              +{activity.pointsEarned} points
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {analytics.recentActivity.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No recent activity. Start practicing to see your activity feed!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};