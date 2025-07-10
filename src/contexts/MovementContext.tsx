import React, { createContext, useContext, useState, useEffect } from 'react';

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
  
  // Actions
  addCombination: (combination: Combination) => void;
  updateMoveCounter: (moveName: string, isForward: boolean, increment: number) => void;
  startMovementSession: (combinationIds: string[]) => Session;
  endMovementSession: (sessionId: string, notes: string) => void;
  
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
  const [savedCombinations, setSavedCombinations] = useState<Combination[]>([]);
  const [moveCounters, setMoveCounters] = useState<MoveCounter[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [currentSessionMoves, setCurrentSessionMoves] = useState<Move[]>([]);
  const [practiceProgress, setPracticeProgress] = useState({
    currentMoveIndex: 0,
    totalMoves: 0,
    completedMoves: 0
  });

  // Load sample data on mount
  useEffect(() => {
    // Load sample combinations for demo
    const sampleCombinations: Combination[] = [
      {
        combination_id: 'sample-1',
        name: 'Basic Forward Sequence',
        moves: [
          { type: 'stance', name: 'forward_stance', description: 'Zenkutsu-dachi', duration_seconds: 3 },
          { type: 'direction', name: 'move_forward', description: 'Step forward', duration_seconds: 2 },
          { type: 'technique', name: 'punch', description: 'Oi-zuki', duration_seconds: 1 }
        ],
        repeat_count: 3,
        created_at: new Date().toISOString()
      },
      {
        combination_id: 'sample-2',
        name: 'Defense Combination',
        moves: [
          { type: 'stance', name: 'back_stance', description: 'Kokutsu-dachi', duration_seconds: 3 },
          { type: 'technique', name: 'down_block', description: 'Gedan-barai', duration_seconds: 2 },
          { type: 'direction', name: 'move_backward', description: 'Step back', duration_seconds: 2 }
        ],
        repeat_count: 2,
        created_at: new Date().toISOString()
      }
    ];

    setSavedCombinations(sampleCombinations);
  }, []);

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

  const addCombination = (combination: Combination) => {
    setSavedCombinations(prev => [...prev, combination]);
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

  const startMovementSession = (combinationIds: string[]): Session => {
    const session: Session = {
      session_id: generateId(),
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
  };

  const endMovementSession = (sessionId: string, notes: string) => {
    if (activeSession && activeSession.session_id === sessionId) {
      const updatedSession: Session = {
        ...activeSession,
        end_time: new Date().toISOString(),
        notes: notes,
        total_moves: currentSessionMoves.length
      };

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
    addCombination,
    updateMoveCounter,
    startMovementSession,
    endMovementSession,
    currentSessionMoves,
    practiceProgress,
    getSessionData,
    getDisplayName
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