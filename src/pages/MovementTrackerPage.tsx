import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMovement } from '../contexts/MovementContext';
import { Activity, Plus, Play, BarChart3, Save, Trash2, SkipForward, SkipBack } from 'lucide-react';

// Types for movement tracking
interface Move {
  move_id?: string;
  type: 'stance' | 'direction' | 'technique';
  name: string;
  description: string;
  duration_seconds: number;
}

interface Combination {
  combination_id: string;
  name: string;
  moves: Move[];
  repeat_count: number;
  created_at: string;
}

interface Session {
  session_id: string;
  combination_ids: string[];
  start_time: string;
  end_time?: string;
  notes: string;
  total_moves: number;
}

interface MoveCounter {
  move_name: string;
  forward_count: number;
  backward_count: number;
  total_count: number;
  last_updated: string;
}

const MovementTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    savedCombinations, 
    moveCounters, 
    activeSession,
    currentSessionMoves,
    addCombination,
    startMovementSession,
    endMovementSession,
    getDisplayName,
    practiceProgress 
  } = useMovement();
  
  console.log('🏃 MovementTrackerPage - Debug Info:');
  console.log('👤 User:', user?.id || 'No user');
  console.log('💾 Saved combinations:', savedCombinations.length);
  console.log('📊 Move counters:', moveCounters.length);
  console.log('🎯 Active session:', !!activeSession);
  console.log('🌐 Current hostname:', window.location.hostname);
  console.log('📍 Current URL:', window.location.href);
  
  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Activity className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the Movement Tracker</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<'builder' | 'practice' | 'stats'>('builder');
  
  // Available moves data
  const [availableMoves] = useState({
    stance: [
      { name: 'forward_stance', display_name: 'Forward Stance', description: 'Zenkutsu-dachi - weight forward, strong attacking position' },
      { name: 'back_stance', display_name: 'Back Stance', description: 'Kokutsu-dachi - weight back, defensive position' },
      { name: 'horse_stance', display_name: 'Horse Stance', description: 'Kiba-dachi - wide stable stance for strength' },
      { name: 'cat_stance', display_name: 'Cat Stance', description: 'Neko-ashi-dachi - light front foot, defensive' },
      { name: 'fighting_stance', display_name: 'Fighting Stance', description: 'Kamae - ready position for combat' },
      { name: 'natural_stance', display_name: 'Natural Stance', description: 'Shizen-tai - relaxed natural position' }
    ],
    direction: [
      { name: 'move_forward', display_name: 'Move Forward', description: 'Step forward maintaining stance' },
      { name: 'move_backward', display_name: 'Move Backward', description: 'Step backward maintaining stance' },
      { name: 'move_left', display_name: 'Move Left', description: 'Step to the left side' },
      { name: 'move_right', display_name: 'Move Right', description: 'Step to the right side' },
      { name: 'turn_left', display_name: 'Turn Left', description: 'Pivot 90 degrees to the left' },
      { name: 'turn_right', display_name: 'Turn Right', description: 'Pivot 90 degrees to the right' },
      { name: 'turn_180', display_name: 'Turn Around', description: 'Pivot 180 degrees' }
    ],
    technique: [
      { name: 'punch', display_name: 'Punch', description: 'Oi-zuki - basic straight punch' },
      { name: 'reverse_punch', display_name: 'Reverse Punch', description: 'Gyaku-zuki - opposite hand punch' },
      { name: 'front_kick', display_name: 'Front Kick', description: 'Mae-geri - kick straight forward' },
      { name: 'side_kick', display_name: 'Side Kick', description: 'Yoko-geri - kick to the side' },
      { name: 'roundhouse_kick', display_name: 'Roundhouse Kick', description: 'Mawashi-geri - circular kick' },
      { name: 'down_block', display_name: 'Down Block', description: 'Gedan-barai - block low attacks' },
      { name: 'high_block', display_name: 'High Block', description: 'Age-uke - block high attacks' },
      { name: 'inside_block', display_name: 'Inside Block', description: 'Uchi-uke - block from inside' },
      { name: 'knife_hand_strike', display_name: 'Knife Hand Strike', description: 'Shuto-uchi - strike with knife hand' },
      { name: 'elbow_strike', display_name: 'Elbow Strike', description: 'Empi-uchi - strike with elbow' }
    ]
  });

  // Local state for form management
  const [currentSequence, setCurrentSequence] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // Form states
  const [selectedMoveType, setSelectedMoveType] = useState<'stance' | 'direction' | 'technique'>('stance');
  const [selectedMove, setSelectedMove] = useState('');
  const [moveDuration, setMoveDuration] = useState(3);
  const [combinationName, setCombinationName] = useState('');
  const [repeatCount, setRepeatCount] = useState(1);
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);

  // Utility functions
  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Movement Builder functions
  const addMoveToSequence = () => {
    if (!selectedMove) return;

    const moveData = availableMoves[selectedMoveType].find(m => m.name === selectedMove);
    if (!moveData) return;

    const move: Move = {
      move_id: generateId(),
      type: selectedMoveType,
      name: selectedMove,
      description: moveData.description,
      duration_seconds: moveDuration
    };

    setCurrentSequence([...currentSequence, move]);
    setSelectedMove('');
  };

  const removeMove = (index: number) => {
    setCurrentSequence(currentSequence.filter((_, i) => i !== index));
  };

  const saveCombination = async () => {
    console.log('🎯 Save Combination clicked!');
    console.log('📋 Combination name:', combinationName);
    console.log('🎬 Current sequence length:', currentSequence.length);
    console.log('👤 User state:', user);
    
    if (!combinationName || currentSequence.length === 0) {
      console.log('⚠️ Validation failed - missing name or moves');
      return;
    }

    const combination: Combination = {
      combination_id: generateId(),
      name: combinationName,
      moves: [...currentSequence],
      repeat_count: repeatCount,
      created_at: new Date().toISOString()
    };

    console.log('📦 Combination to save:', combination);

    try {
      console.log('🚀 Calling addCombination...');
      // Use the addCombination method from MovementContext
      await addCombination(combination);
      console.log('✅ Combination saved successfully!');
      setCurrentSequence([]);
      setCombinationName('');
      setRepeatCount(1);
    } catch (error) {
      console.error('❌ Error saving combination:', error);
      // Show error message to user
      alert(error instanceof Error ? error.message : 'Failed to save combination');
    }
  };

  // Practice Session functions
  const startSession = async () => {
    if (selectedCombinations.length === 0) return;

    try {
      await startMovementSession(selectedCombinations);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      await endMovementSession(activeSession.session_id, sessionNotes);
      setSessionNotes('');
      setSelectedCombinations([]);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const nextMove = () => {
    if (practiceProgress.currentMoveIndex < currentSessionMoves.length - 1) {
      // In a full implementation, this would update the context
      // For now, we'll use local state for navigation
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const previousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-3">
            <Activity size={48} />
            <div>
              <h1 className="text-4xl font-bold">Kata Movement Tracker</h1>
              <p className="text-blue-100">Build combinations, practice movements, and track your progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'builder', label: 'Movement Builder', icon: <Plus size={20} /> },
            { id: 'practice', label: 'Practice Session', icon: <Play size={20} /> },
            { id: 'stats', label: 'Statistics', icon: <BarChart3 size={20} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Movement Builder Tab */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Move Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Plus className="mr-2" size={20} />
                Build Combination
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Move Type</label>
                  <select
                    value={selectedMoveType}
                    onChange={(e) => {
                      setSelectedMoveType(e.target.value as typeof selectedMoveType);
                      setSelectedMove('');
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="stance">Stance</option>
                    <option value="direction">Direction</option>
                    <option value="technique">Technique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Move</label>
                  <select
                    value={selectedMove}
                    onChange={(e) => setSelectedMove(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a {selectedMoveType}...</option>
                    {availableMoves[selectedMoveType].map(move => (
                      <option key={move.name} value={move.name} title={move.description}>
                        {move.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={moveDuration}
                    onChange={(e) => setMoveDuration(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={addMoveToSequence}
                  disabled={!selectedMove}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Move
                </button>
              </div>
            </div>

            {/* Current Sequence */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Current Sequence</h3>
                <button
                  onClick={() => setCurrentSequence([])}
                  className="text-red-600 hover:text-red-700"
                  disabled={currentSequence.length === 0}
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Combination Name</label>
                  <input
                    type="text"
                    value={combinationName}
                    onChange={(e) => setCombinationName(e.target.value)}
                    placeholder="Enter combination name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeat Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {currentSequence.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No moves added yet</p>
                ) : (
                  currentSequence.map((move, index) => (
                    <div key={move.move_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{getDisplayName(move.type, move.name)}</p>
                          <p className="text-sm text-gray-500">{move.type} • {move.duration_seconds}s</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => saveCombination()}
                disabled={!combinationName || currentSequence.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>Save Combination</span>
              </button>
            </div>

            {/* Saved Combinations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Saved Combinations</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedCombinations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No combinations saved yet</p>
                ) : (
                  savedCombinations.map(combination => (
                    <div key={combination.combination_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{combination.name}</h4>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                          ×{combination.repeat_count}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {combination.moves.map((move, index) => 
                          `${index + 1}. ${getDisplayName(move.type, move.name)}`
                        ).join(' → ')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Practice Session Tab */}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Session Control */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Play className="mr-2" size={20} />
                Practice Session
              </h3>

              {!activeSession ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Combinations to Practice</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {savedCombinations.length === 0 ? (
                        <p className="text-gray-500">No combinations available. Create some combinations first.</p>
                      ) : (
                        savedCombinations.map(combination => (
                          <label key={combination.combination_id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
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
                              className="rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span>{combination.name} (×{combination.repeat_count})</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      try {
                        startSession();
                      } catch (error) {
                        console.error('Error starting session:', error);
                      }
                    }}
                    disabled={selectedCombinations.length === 0}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  >
                    Start Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Add notes about your practice session..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await endSession();
                      } catch (error) {
                        console.error('Error ending session:', error);
                      }
                    }}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg"
                  >
                    End Session
                  </button>
                </div>
              )}
            </div>

            {/* Current Move Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Current Move</h3>
              
              <div className={`min-h-48 flex flex-col items-center justify-center border-4 border-dashed rounded-xl p-8 transition-all ${
                activeSession ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {!activeSession ? (
                  <div className="text-center">
                    <h2 className="text-xl text-gray-500 mb-2">No active session</h2>
                    <p className="text-gray-400">Start a session to begin practicing</p>
                  </div>
                ) : currentSessionMoves.length > 0 ? (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-blue-600 mb-2">
                      {getDisplayName(currentSessionMoves[currentMoveIndex].type, currentSessionMoves[currentMoveIndex].name)}
                    </h2>
                    <p className="text-lg text-blue-500 mb-2">{currentSessionMoves[currentMoveIndex].type}</p>
                    <p className="text-gray-600 mb-4">{currentSessionMoves[currentMoveIndex].description}</p>
                    
                    <div className="flex justify-center space-x-4 mb-4">
                      <button
                        onClick={previousMove}
                        disabled={currentMoveIndex === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SkipBack size={20} />
                        <span>Previous</span>
                      </button>
                      <button
                        onClick={nextMove}
                        disabled={currentMoveIndex === currentSessionMoves.length - 1}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Next</span>
                        <SkipForward size={20} />
                      </button>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentMoveIndex + 1) / currentSessionMoves.length) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="font-medium">Current Move</p>
                        <p>{currentMoveIndex + 1} / {currentSessionMoves.length}</p>
                      </div>
                      <div>
                        <p className="font-medium">Progress</p>
                        <p>{Math.round(((currentMoveIndex + 1) / currentSessionMoves.length) * 100)}%</p>
                      </div>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p>{currentSessionMoves[currentMoveIndex].duration_seconds}s</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-xl text-gray-500">Session started</h2>
                    <p className="text-gray-400">No moves in selected combinations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Summary Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-gray-600">Total Combinations</h4>
                  <p className="text-2xl font-bold text-blue-600">{savedCombinations.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-gray-600">Moves Practiced</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {moveCounters.reduce((sum, counter) => sum + counter.total_count, 0)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-gray-600">Most Practiced</h4>
                  <p className="text-lg font-bold text-orange-600">
                    {moveCounters.length > 0 
                      ? getDisplayName('direction', moveCounters.reduce((max, counter) => 
                          counter.total_count > max.total_count ? counter : max
                        ).move_name)
                      : '-'
                    }
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-gray-600">Available Moves</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {availableMoves.stance.length + availableMoves.direction.length + availableMoves.technique.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Move Counters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Movement Statistics</h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {moveCounters.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No movement data yet. Complete some practice sessions to see statistics.</p>
                ) : (
                  moveCounters.map(counter => (
                    <div key={counter.move_name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{getDisplayName('direction', counter.move_name)}</h4>
                        <span className="text-lg font-bold text-blue-600">{counter.total_count}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Forward: {counter.forward_count}</div>
                        <div>Backward: {counter.backward_count}</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Last updated: {new Date(counter.last_updated).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementTrackerPage;