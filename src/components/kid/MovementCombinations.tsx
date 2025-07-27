import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMovement } from '../../contexts/MovementContext';
import { Play, Square, SkipForward, SkipBack, Activity, CheckCircle2 } from 'lucide-react';

const MovementCombinations: React.FC = () => {
  const { 
    savedCombinations, 
    activeSession, 
    currentSessionMoves,
    practiceProgress,
    startMovementSession, 
    endMovementSession,
    getDisplayName,
    getSessionData
  } = useMovement();

  const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');

  const sessionData = getSessionData();

  const handleStartSession = async () => {
    if (selectedCombinations.length > 0) {
      try {
        await startMovementSession(selectedCombinations);
        setCurrentMoveIndex(0);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    }
  };

  const handleEndSession = async () => {
    if (activeSession) {
      try {
        await endMovementSession(activeSession.session_id, sessionNotes);
        setSelectedCombinations([]);
        setCurrentMoveIndex(0);
        setSessionNotes('');
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  };

  const nextMove = () => {
    if (currentMoveIndex < currentSessionMoves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const previousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const getCurrentMove = () => {
    return currentSessionMoves[currentMoveIndex];
  };

  const getProgress = () => {
    if (currentSessionMoves.length === 0) return 0;
    return ((currentMoveIndex + 1) / currentSessionMoves.length) * 100;
  };

  if (!activeSession) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="text-blue-600" size={20} />
          <h4 className="text-md font-semibold text-blue-800">Movement Combinations</h4>
        </div>

        {savedCombinations.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-700 text-sm">
              No movement combinations available.
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Visit the Movement Tracker to create combinations!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedCombinations.map(combination => (
                <label key={combination.combination_id} className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCombinations.includes(combination.combination_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCombinations([...selectedCombinations, combination.combination_id]);
                      } else {
                        setSelectedCombinations(selectedCombinations.filter(id => id !== combination.combination_id));
                      }
                    }}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{combination.name}</p>
                    <p className="text-xs text-blue-600">
                      {combination.moves.length} moves × {combination.repeat_count}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    ×{combination.repeat_count}
                  </span>
                </label>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartSession}
              disabled={selectedCombinations.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Play size={18} />
              <span>Start Movement Session</span>
            </motion.button>
          </>
        )}
      </div>
    );
  }

  const currentMove = getCurrentMove();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="text-green-600" size={20} />
          <h4 className="text-md font-semibold text-green-800">Movement Session Active</h4>
        </div>
        <div className="text-xs text-green-600">
          {sessionData.combinations} combinations • {sessionData.moves} moves
        </div>
      </div>

      {/* Current Move Display */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-green-800 mb-1">
            {currentMove ? getDisplayName(currentMove.type, currentMove.name) : 'No moves'}
          </h3>
          {currentMove && (
            <>
              <p className="text-sm text-green-600 font-medium capitalize mb-1">
                {currentMove.type}
              </p>
              <p className="text-xs text-gray-600">
                {currentMove.description}
              </p>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Move {currentMoveIndex + 1} of {currentSessionMoves.length}</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center space-x-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={previousMove}
            disabled={currentMoveIndex === 0}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <SkipBack size={14} />
            <span>Previous</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMove}
            disabled={currentMoveIndex === currentSessionMoves.length - 1}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span>Next</span>
            <SkipForward size={14} />
          </motion.button>
        </div>

        {/* Move Duration */}
        {currentMove && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center space-x-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              <span>Hold for {currentMove.duration_seconds}s</span>
            </span>
          </div>
        )}
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white border border-green-200 rounded-lg p-2 text-center">
          <p className="text-xs text-green-600">Combinations</p>
          <p className="text-sm font-bold text-green-800">{sessionData.combinations}</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-2 text-center">
          <p className="text-xs text-blue-600">Total Moves</p>
          <p className="text-sm font-bold text-blue-800">{sessionData.moves}</p>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-2 text-center">
          <p className="text-xs text-orange-600">Time</p>
          <p className="text-sm font-bold text-orange-800">
            {Math.floor(sessionData.sessionTime / 60)}:{(sessionData.sessionTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Session Notes */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">Session Notes (optional)</label>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="How did this session go?"
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* End Session Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleEndSession}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
      >
        <CheckCircle2 size={18} />
        <span>Complete Movement Session</span>
      </motion.button>
    </div>
  );
};

export default MovementCombinations;