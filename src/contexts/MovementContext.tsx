import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';
import { getAllKataNames } from '../data/extractedKataData';

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

interface MovementContextType {
  // Data
  savedCombinations: Combination[];
  moveCounters: MoveCounter[];
  activeSession: Session | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  addCombination: (combination: Combination) => Promise<void>;
  updateMoveCounter: (moveName: string, isForward: boolean, increment: number) => void;
  startMovementSession: (combinationIds: string[]) => Promise<Session>;
  endMovementSession: (sessionId: string, notes: string) => Promise<void>;
  
  // Current session data for practice integration
  currentSessionMoves: Move[];
  practiceProgress: {
    currentMoveIndex: number;
    totalMoves: number;
    completedMoves: number;
  };
  
  // Practice integration
  getSessionData: () => {
    combinations: number;
    moves: number;
    sessionTime: number;
  };
  
  // Utility
  getDisplayName: (type: string, name: string) => string;
  loadUserData: () => Promise<void>;
}

const MovementContext = createContext<MovementContextType | undefined>(undefined);

// Available moves data
const availableMoves = {
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
};

export const MovementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 MovementProvider initializing...');
  const { user } = useAuth();
  
  console.log('👤 MovementProvider user:', user?.id || 'No user');
  
  const [savedCombinations, setSavedCombinations] = useState<Combination[]>([]);
  const [moveCounters, setMoveCounters] = useState<MoveCounter[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [currentSessionMoves, setCurrentSessionMoves] = useState<Move[]>([]);
  const [practiceProgress, setPracticeProgress] = useState({
    currentMoveIndex: 0,
    totalMoves: 0,
    completedMoves: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount and when user changes
  useEffect(() => {
    console.log('⚡ MovementProvider useEffect triggered, user ID:', user?.id);
    if (user?.id) {
      loadUserData();
    } else {
      console.log('⚠️ No user ID available, skipping data load');
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    console.log('🔄 Loading movement data for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      // Load combinations and move counters in parallel
      console.log('📡 Fetching combinations and move counters...');
      const [combinationsResponse, countersResponse] = await Promise.all([
        apiService.getCombinations(user.id),
        apiService.getMoveCounters(user.id)
      ]);

      console.log('📦 Combinations response:', combinationsResponse);
      console.log('📊 Counters response:', countersResponse);

      if (combinationsResponse.success) {
        setSavedCombinations(combinationsResponse.combinations || []);
        console.log('✅ Loaded combinations:', combinationsResponse.combinations?.length || 0);
      } else {
        console.warn('⚠️ Combinations response not successful:', combinationsResponse);
      }

      if (countersResponse.success) {
        setMoveCounters(countersResponse.counters || []);
        console.log('✅ Loaded move counters:', countersResponse.counters?.length || 0);
      } else {
        console.warn('⚠️ Counters response not successful:', countersResponse);
      }
    } catch (err) {
      console.error('❌ Failed to load movement data:', err);
      setError('Failed to load movement data');
      
      // Load authentic Shotokan combinations based on extracted kata database
      console.log('🔄 Loading authentic Shotokan combinations from extracted kata database...');
      const extractedKataNames = getAllKataNames();
      const shotkoanCombinations: Combination[] = [
        {
          combination_id: 'shotokan-1',
          name: `${extractedKataNames[0]} Opening Sequence`,
          moves: [
            { type: 'stance', name: 'ready_stance', description: 'Mushin-dachi (Ready stance)', duration_seconds: 2 },
            { type: 'direction', name: 'turn_left', description: 'Turn left 90 degrees', duration_seconds: 1 },
            { type: 'technique', name: 'down_block', description: 'Gedan-barai (Downward block)', duration_seconds: 2 },
            { type: 'direction', name: 'step_forward', description: 'Step forward', duration_seconds: 1 },
            { type: 'technique', name: 'punch', description: 'Oi-zuki (Lunge punch)', duration_seconds: 1 }
          ],
          repeat_count: 3,
          created_at: new Date().toISOString()
        },
        {
          combination_id: 'shotokan-2',
          name: `${extractedKataNames[1]} Basic Movements`,
          moves: [
            { type: 'stance', name: 'forward_stance', description: 'Zenkutsu-dachi', duration_seconds: 2 },
            { type: 'technique', name: 'rising_block', description: 'Age-uke (Rising block)', duration_seconds: 2 },
            { type: 'technique', name: 'reverse_punch', description: 'Gyaku-zuki (Reverse punch)', duration_seconds: 1 },
            { type: 'direction', name: 'step_back', description: 'Step back into stance', duration_seconds: 1 }
          ],
          repeat_count: 2,
          created_at: new Date().toISOString()
        },
        {
          combination_id: 'shotokan-3',
          name: `${extractedKataNames[5]} Training Pattern`,
          moves: [
            { type: 'stance', name: 'horse_stance', description: 'Kiba-dachi (Horse stance)', duration_seconds: 3 },
            { type: 'technique', name: 'hammer_fist', description: 'Tettsui-uchi (Hammer fist)', duration_seconds: 2 },
            { type: 'direction', name: 'side_step', description: 'Side step in horse stance', duration_seconds: 2 }
          ],
          repeat_count: 4,
          created_at: new Date().toISOString()
        }
      ];
      setSavedCombinations(shotkoanCombinations);
      console.log('📋 Authentic Shotokan combinations loaded:', shotkoanCombinations.length);
    } finally {
      setLoading(false);
      console.log('✅ Movement data loading complete');
    }
  };

  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getDisplayName = (type: string, name: string) => {
    const moveType = availableMoves[type as keyof typeof availableMoves];
    if (moveType) {
      const move = moveType.find(m => m.name === name);
      return move ? move.display_name : name;
    }
    return name;
  };

  const addCombination = async (combination: Combination) => {
    if (!user?.id) {
      console.error('❌ No user logged in, cannot save combination');
      throw new Error('User not authenticated. Please log in to save combinations.');
    }

    try {
      const response = await apiService.addCombination({
        user_id: user.id,
        name: combination.name,
        moves: combination.moves.map(move => ({
          type: move.type,
          name: move.name,
          description: move.description,
          duration_seconds: move.duration_seconds
        })),
        repeat_count: combination.repeat_count
      });

      if (response.success) {
        // Add the combination with the ID from the server
        const newCombination = {
          ...combination,
          combination_id: response.combination?.combination_id || response.combination_id
        };
        setSavedCombinations(prev => [...prev, newCombination]);
        console.log('✅ Combination added successfully:', newCombination);
        console.log('📋 Updated combinations list:', prev => [...prev, newCombination]);
      }
    } catch (err) {
      console.error('Failed to save combination:', err);
      // Add locally as fallback
      setSavedCombinations(prev => [...prev, combination]);
      console.log('⚠️ Added combination locally as fallback');
    }
  };

  const updateMoveCounter = (moveName: string, isForward: boolean, increment: number) => {
    setMoveCounters(prev => {
      const existing = prev.find(c => c.move_name === moveName);
      
      if (existing) {
        return prev.map(c => 
          c.move_name === moveName
            ? {
                ...c,
                forward_count: isForward ? c.forward_count + increment : c.forward_count,
                backward_count: !isForward ? c.backward_count + increment : c.backward_count,
                total_count: isForward 
                  ? c.total_count + increment 
                  : c.total_count + increment,
                last_updated: new Date().toISOString()
              }
            : c
        );
      } else {
        return [...prev, {
          move_name: moveName,
          forward_count: isForward ? increment : 0,
          backward_count: !isForward ? increment : 0,
          total_count: increment,
          last_updated: new Date().toISOString()
        }];
      }
    });
  };

  const startMovementSession = async (combinationIds: string[]): Promise<Session> => {
    if (!user?.id) {
      throw new Error('User not logged in');
    }

    try {
      const response = await apiService.createMovementSession({
        user_id: user.id,
        combination_ids: combinationIds,
        notes: ''
      });

      if (response.success) {
        const session: Session = {
          session_id: response.session_id,
          combination_ids: combinationIds,
          start_time: new Date().toISOString(),
          notes: '',
          total_moves: 0
        };

        // Build session moves
        const moves: Move[] = [];
        combinationIds.forEach(combId => {
          const combination = savedCombinations.find(c => c.combination_id === combId);
          if (combination) {
            for (let repeat = 0; repeat < combination.repeat_count; repeat++) {
              moves.push(...combination.moves);
            }
          }
        });

        setActiveSession(session);
        setCurrentSessionMoves(moves);
        setPracticeProgress({
          currentMoveIndex: 0,
          totalMoves: moves.length,
          completedMoves: 0
        });

        return session;
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      console.error('Failed to start movement session:', err);
      // Create local session as fallback
      const session: Session = {
        session_id: generateId(),
        combination_ids: combinationIds,
        start_time: new Date().toISOString(),
        notes: '',
        total_moves: 0
      };

      const moves: Move[] = [];
      combinationIds.forEach(combId => {
        const combination = savedCombinations.find(c => c.combination_id === combId);
        if (combination) {
          for (let repeat = 0; repeat < combination.repeat_count; repeat++) {
            moves.push(...combination.moves);
          }
        }
      });

      setActiveSession(session);
      setCurrentSessionMoves(moves);
      setPracticeProgress({
        currentMoveIndex: 0,
        totalMoves: moves.length,
        completedMoves: 0
      });

      return session;
    }
  };

  const endMovementSession = async (sessionId: string, notes: string) => {
    if (!activeSession || activeSession.session_id !== sessionId) return;

    try {
      await apiService.endMovementSession(sessionId, notes);

      // Update move counters for completed moves
      currentSessionMoves.forEach(move => {
        if (move.type === 'direction' && (move.name.includes('forward') || move.name.includes('backward'))) {
          updateMoveCounter(move.name, move.name.includes('forward'), 1);
        }
      });

      setActiveSession(null);
      setCurrentSessionMoves([]);
      setPracticeProgress({
        currentMoveIndex: 0,
        totalMoves: 0,
        completedMoves: 0
      });
    } catch (err) {
      console.error('Failed to end movement session:', err);
      // Still clear the local session even if API call fails
      setActiveSession(null);
      setCurrentSessionMoves([]);
      setPracticeProgress({
        currentMoveIndex: 0,
        totalMoves: 0,
        completedMoves: 0
      });
    }
  };

  const getSessionData = () => {
    if (!activeSession) {
      return { combinations: 0, moves: 0, sessionTime: 0 };
    }

    const sessionTime = activeSession.start_time 
      ? Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 1000)
      : 0;

    return {
      combinations: activeSession.combination_ids.length,
      moves: currentSessionMoves.length,
      sessionTime
    };
  };

  const value: MovementContextType = {
    savedCombinations,
    moveCounters,
    activeSession,
    loading,
    error,
    addCombination,
    updateMoveCounter,
    startMovementSession,
    endMovementSession,
    currentSessionMoves,
    practiceProgress,
    getSessionData,
    getDisplayName,
    loadUserData
  };

  return (
    <MovementContext.Provider value={value}>
      {children}
    </MovementContext.Provider>
  );
};

export const useMovement = (): MovementContextType => {
  const context = useContext(MovementContext);
  if (context === undefined) {
    throw new Error('useMovement must be used within a MovementProvider');
  }
  return context;
};

export type { Move, Combination, Session, MoveCounter };