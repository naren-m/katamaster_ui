import React, { useState, useEffect } from 'react';
import { CalendarView } from '../components/shared/CalendarView';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

type AuditEntry = {
  id: string;
  session_id: string;
  session_type: string;
  activity_name: string;
  activity_count: number;
  points_earned: number;
  points_calculation: string;
  earned_date: string;
  earned_at: string;
};

type PracticeHistoryEntry = {
  session_id: string;
  date: string;
  duration_minutes: number;
  punches: number;
  kicks: number;
  katas: Array<{name: string, repetitions: number}>;
  techniques: Array<{technique_id: string, count: number}>;
  points_earned: number;
  notes: string;
};

export const PointsCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const userId = user?.id || 'guest';

  useEffect(() => {
    loadAuditData();
  }, [dateRange]);

  useEffect(() => {
    if (selectedDate) {
      loadPracticeHistoryForDate(selectedDate);
    }
  }, [selectedDate]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPointsAudit(userId, dateRange.startDate, dateRange.endDate);
      setAuditEntries(data.audit_entries || []);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeHistoryForDate = async (date: string) => {
    try {
      const data = await apiService.getPracticeHistory(userId, 1, 10, date);
      setPracticeHistory(data.practice_history || []);
    } catch (error) {
      console.error('Failed to load practice history:', error);
    }
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalPointsForPeriod = () => {
    return auditEntries.reduce((sum, entry) => sum + entry.points_earned, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Calendar & Points Audit</h1>
          <p className="text-gray-600">Track your earned points and practice history</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{getTotalPointsForPeriod()}</div>
            <div className="text-gray-600">Total Points (Last 30 days)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{auditEntries.length}</div>
            <div className="text-gray-600">Practice Activities</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(auditEntries.map(e => e.earned_date)).size}
            </div>
            <div className="text-gray-600">Active Days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div>
            <CalendarView userId={userId} onDateClick={handleDateClick} />
          </div>

          {/* Points Audit and Practice Details */}
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Filter by Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Practice Details - {formatDate(selectedDate)}
                </h3>
                {practiceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {practiceHistory.map((session) => (
                      <div key={session.session_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900">
                            Session {session.session_id.slice(-6)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            +{session.points_earned} points
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Duration: {session.duration_minutes} minutes</div>
                          {session.punches > 0 && <div>Punches: {session.punches}</div>}
                          {session.kicks > 0 && <div>Kicks: {session.kicks}</div>}
                          {session.katas.length > 0 && (
                            <div>Katas: {session.katas.map(k => `${k.name} x${k.repetitions}`).join(', ')}</div>
                          )}
                          {session.notes && <div>Notes: {session.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No practice sessions found for this date.</p>
                )}
              </div>
            )}

            {/* Points Audit */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Points Audit Trail</h3>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : auditEntries.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditEntries.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{entry.activity_name}</div>
                          <div className="text-sm text-gray-600">
                            {entry.activity_count} × {entry.session_type}
                          </div>
                          <div className="text-xs text-gray-500">{entry.points_calculation}</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(entry.earned_date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +{entry.points_earned}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No points audit entries found for the selected period.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};