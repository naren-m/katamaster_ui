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
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Polling interval configuration
  const POLLING_INTERVAL = 30000; // 30 seconds
  const MIN_POLLING_INTERVAL = 10000; // 10 seconds minimum to avoid rate limiting
  const MAX_POLLING_INTERVAL = 300000; // 5 minutes maximum

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  // Set up automatic polling for real-time updates
  useEffect(() => {
    if (!user?.id || !autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchAnalytics(true); // true indicates it's an auto-refresh
    }, POLLING_INTERVAL);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [user?.id, autoRefreshEnabled]);

  const fetchAnalytics = async (isAutoRefresh = false) => {
    if (!user?.id) return;
    
    try {
      // Don't show loading spinner for auto-refresh to avoid UI flickering
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
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
        
        // Update last refreshed timestamp
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      // Only show error state on initial load, not on auto-refresh
      if (!isAutoRefresh) {
        setAnalytics({
          stats: getDefaultStats(),
          topKatas: [],
          recentActivity: [],
          progressTrend: []
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  // Animated stat component for smooth number transitions
  const AnimatedStat: React.FC<{
    label: string;
    value: number | string;
    icon: string;
    color?: string;
    format?: (val: number) => string;
    testId: string;
  }> = ({ label, value, icon, color = 'text-gray-900', format, testId }) => {
    const displayValue = format && typeof value === 'number' ? format(value) : value;
    
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm" data-testid={testId}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <motion.p 
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`text-2xl font-bold ${color}`}
            >
              {displayValue}
            </motion.p>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    );
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
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Unavailable</h2>
          <p className="text-sm text-gray-600 mb-4">
            Unable to connect to the backend service. The dashboard data cannot be loaded at this time.
          </p>
          <button 
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
          >
            🔄 Retry Connection
          </button>
          <p className="text-xs text-gray-500 mt-3">
            If this issue persists, please check that the backend service is running.
          </p>
        </div>
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
          {lastRefreshed && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              Last updated: {lastRefreshed.toLocaleTimeString()}
              {autoRefreshEnabled && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Auto-refresh enabled
                    {refreshing && (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          
          {/* Manual refresh button */}
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
              <AnimatedStat
                label="Katas Practiced"
                value={analytics.stats.totalKatasPracticed}
                icon={getStatIcon('katas')}
                testId="stat-katas"
              />

              <AnimatedStat
                label="Total Sessions"
                value={analytics.stats.totalSessions}
                icon={getStatIcon('sessions')}
                testId="stat-sessions"
              />

              <AnimatedStat
                label="Repetitions"
                value={analytics.stats.totalRepetitions}
                icon={getStatIcon('repetitions')}
                format={formatNumber}
                testId="stat-repetitions"
              />

              <AnimatedStat
                label="Total Points"
                value={analytics.stats.totalPoints}
                icon={getStatIcon('points')}
                color="text-purple-600"
                format={formatNumber}
                testId="stat-points"
              />

              <AnimatedStat
                label="Current Streak"
                value={`${analytics.stats.currentStreak} days`}
                icon={getStatIcon('streak')}
                color="text-orange-600"
                testId="stat-streak"
              />

              <AnimatedStat
                label="Mastered"
                value={analytics.stats.masteredKatas}
                icon={getStatIcon('mastered')}
                color="text-green-600"
                testId="stat-mastered"
              />

              <AnimatedStat
                label="Avg Rating"
                value={(analytics.stats.averageRating || 0).toFixed(1)}
                icon={getStatIcon('rating')}
                color="text-yellow-600"
                testId="stat-rating"
              />

              <AnimatedStat
                label="Practice Time"
                value={`${Math.round(analytics.stats.totalPracticeMinutes / 60)}h`}
                icon={getStatIcon('minutes')}
                color="text-blue-600"
                testId="stat-minutes"
              />
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