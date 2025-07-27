import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

interface ProgressData {
  kataId: string;
  userId: string;
  totalPracticeSessions: number;
  totalPracticeMinutes: number;
  totalRepetitions: number;
  averageRating: number;
  lastPracticed: string;
  mastered: boolean;
  masteryPercentage: number;
  nextGoal: string;
}

interface KataProgressProps {
  kataId: string;
  kataName: string;
  onPracticeRecord?: () => void;
}

export const KataProgress: React.FC<KataProgressProps> = ({ 
  kataId, 
  kataName, 
  onPracticeRecord 
}) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [practiceForm, setPracticeForm] = useState({
    repetitions: 1,
    notes: '',
    durationMinutes: 30,
    selfRating: 7.5,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProgress();
    }
  }, [user?.id, kataId]);

  const fetchProgress = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const progressData = await apiService.getKataProgress(user.id, kataId);
      if (progressData?.progress) {
        setProgress(progressData.progress);
      }
    } catch (error) {
      console.error('Failed to fetch kata progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || submitting) return;

    try {
      setSubmitting(true);
      await apiService.recordKataPractice({
        kataId,
        userId: user.id,
        repetitions: practiceForm.repetitions,
        notes: practiceForm.notes,
        durationMinutes: practiceForm.durationMinutes,
        selfRating: practiceForm.selfRating,
        focusAreas: ['form', 'timing', 'power'],
      });

      // Refresh progress data
      await fetchProgress();
      
      // Reset form
      setPracticeForm({
        repetitions: 1,
        notes: '',
        durationMinutes: 30,
        selfRating: 7.5,
      });
      
      setShowPracticeForm(false);
      onPracticeRecord?.();
      
    } catch (error) {
      console.error('Failed to record practice:', error);
      alert('Failed to record practice session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMasteryBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 border-yellow-200';
    return 'bg-gray-100 border-gray-200';
  };

  if (!user) {
    return (
      <div className="text-center p-4 text-gray-500 text-sm">
        Sign in to track your kata progress
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-2 ${getMasteryBgColor(progress.masteryPercentage)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Progress Summary</h4>
            {progress.mastered && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ✅ Mastered
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-600">Total Repetitions</p>
              <p className="font-semibold text-lg">{progress.totalRepetitions}</p>
            </div>
            <div>
              <p className="text-gray-600">Sessions</p>
              <p className="font-semibold text-lg">{progress.totalPracticeSessions}</p>
            </div>
            <div>
              <p className="text-gray-600">Practice Time</p>
              <p className="font-semibold">{progress.totalPracticeMinutes}min</p>
            </div>
            <div>
              <p className="text-gray-600">Avg Rating</p>
              <p className="font-semibold">{(progress.averageRating || 0).toFixed(1)}/10</p>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Mastery Level</span>
              <span className={`text-xs font-medium ${getMasteryColor(progress.masteryPercentage)}`}>
                {progress.masteryPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress.masteryPercentage >= 80 ? 'bg-green-500' :
                  progress.masteryPercentage >= 60 ? 'bg-blue-500' :
                  progress.masteryPercentage >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(progress.masteryPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Next Goal */}
          <div className="mt-3 p-2 bg-white/50 rounded border">
            <p className="text-xs text-gray-600 mb-1">Next Goal:</p>
            <p className="text-xs font-medium">{progress.nextGoal}</p>
          </div>

          {/* Last Practiced */}
          {progress.lastPracticed && (
            <p className="text-xs text-gray-500 mt-2">
              Last practiced: {new Date(progress.lastPracticed).toLocaleDateString()}
            </p>
          )}
        </motion.div>
      )}

      {/* Practice Session Form */}
      {showPracticeForm ? (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleRecordPractice}
          className="space-y-3 p-4 bg-gray-50 rounded-lg border"
        >
          <h4 className="font-medium text-sm mb-3">Record Practice Session</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Repetitions</label>
              <input
                type="number"
                min="1"
                max="50"
                value={practiceForm.repetitions}
                onChange={(e) => setPracticeForm(prev => ({ 
                  ...prev, 
                  repetitions: parseInt(e.target.value) || 1 
                }))}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Duration (min)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={practiceForm.durationMinutes}
                onChange={(e) => setPracticeForm(prev => ({ 
                  ...prev, 
                  durationMinutes: parseInt(e.target.value) || 30 
                }))}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Self Rating (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={practiceForm.selfRating}
              onChange={(e) => setPracticeForm(prev => ({ 
                ...prev, 
                selfRating: parseFloat(e.target.value) || 7.5 
              }))}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Notes (optional)</label>
            <textarea
              value={practiceForm.notes}
              onChange={(e) => setPracticeForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How did the practice go? Focus areas, improvements, challenges..."
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 h-16 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Recording...' : 'Record Session'}
            </button>
            <button
              type="button"
              onClick={() => setShowPracticeForm(false)}
              className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      ) : (
        <button
          onClick={() => setShowPracticeForm(true)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>📝 Record Practice</span>
        </button>
      )}
    </div>
  );
};