import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { sampleData } from '../data/sampleData';

type Kata = {
  name: string;
  repetitions: number;
};

type Session = {
  id: number;
  date: string;
  punches: number;
  kicks: number;
  duration: number;
  katas: string[];
  pointsEarned: number;
};

type PracticeContextType = {
  currentPunches: number;
  currentKicks: number;
  currentKatas: Kata[];
  sessionTimer: number;
  isSessionActive: boolean;
  totalPoints: number;
  currentStreak: number;
  totalPunches: number;
  totalKicks: number;
  totalSessions: number;
  favoriteKata: string;
  recentSessions: Session[];
  kataList: string[];
  
  incrementPunches: () => void;
  incrementKicks: () => void;
  addKata: (kataName: string, repetitions: number) => void;
  startSession: () => void;
  endSession: () => number;
  resetCurrentSession: () => void;
};

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const [currentPunches, setCurrentPunches] = useState(0);
  const [currentKicks, setCurrentKicks] = useState(0);
  const [currentKatas, setCurrentKatas] = useState<Kata[]>([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  
  const [totalPoints, setTotalPoints] = useState(sampleData.child.totalPoints);
  const [currentStreak, setCurrentStreak] = useState(sampleData.child.currentStreak);
  const [totalPunches, setTotalPunches] = useState(sampleData.child.totalPunches);
  const [totalKicks, setTotalKicks] = useState(sampleData.child.totalKicks);
  const [totalSessions, setTotalSessions] = useState(sampleData.child.totalSessions);
  const [favoriteKata, setFavoriteKata] = useState(sampleData.child.favoriteKata);
  const [recentSessions, setRecentSessions] = useState<Session[]>(sampleData.recentSessions);
  const [kataList, setKataList] = useState(sampleData.kataList);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const incrementPunches = () => {
    setCurrentPunches(prev => prev + 1);
  };

  const incrementKicks = () => {
    setCurrentKicks(prev => prev + 1);
  };

  const addKata = (kataName: string, repetitions: number) => {
    setCurrentKatas(prev => [...prev, { name: kataName, repetitions }]);
  };

  const startSession = () => {
    setIsSessionActive(true);
    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval as unknown as number);
  };

  const updateStreak = (newSessionDate: string) => {
    // Get the last session date
    const lastSession = recentSessions[0];
    if (!lastSession) {
      return 1; // First session ever
    }

    const lastDate = new Date(lastSession.date);
    const currentDate = new Date(newSessionDate);
    
    // Reset streak if more than a day has been missed
    if ((currentDate.getTime() - lastDate.getTime()) > (24 * 60 * 60 * 1000)) {
      return 1;
    }
    
    // Only increment streak if it's a new day (not same day practice)
    if (lastSession.date !== newSessionDate) {
      return currentStreak + 1;
    }
    
    return currentStreak;
  };

  const endSession = () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsSessionActive(false);
    
    // Calculate points earned (1 point per 10 punches/kicks + 5 points per kata repetition)
    const punchPoints = Math.floor(currentPunches / 10);
    const kickPoints = Math.floor(currentKicks / 10);
    const kataPoints = currentKatas.reduce((sum, kata) => sum + (kata.repetitions * 5), 0);
    const pointsEarned = 10 + punchPoints + kickPoints + kataPoints;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Create new session record
    const newSession: Session = {
      id: Date.now(),
      date: today,
      punches: currentPunches,
      kicks: currentKicks,
      duration: sessionTimer,
      katas: currentKatas.map(k => `${k.name} x${k.repetitions}`),
      pointsEarned
    };
    
    // Update state
    setRecentSessions(prev => [newSession, ...prev]);
    setTotalPoints(prev => prev + pointsEarned);
    setTotalPunches(prev => prev + currentPunches);
    setTotalKicks(prev => prev + currentKicks);
    setTotalSessions(prev => prev + 1);
    setCurrentStreak(prev => updateStreak(today));
    
    // Reset current session
    resetCurrentSession();
    
    return pointsEarned;
  };

  const resetCurrentSession = () => {
    setCurrentPunches(0);
    setCurrentKicks(0);
    setCurrentKatas([]);
    setSessionTimer(0);
    setIsSessionActive(false);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  };

  return (
    <PracticeContext.Provider value={{
      currentPunches,
      currentKicks,
      currentKatas,
      sessionTimer,
      isSessionActive,
      totalPoints,
      currentStreak,
      totalPunches,
      totalKicks,
      totalSessions,
      favoriteKata,
      recentSessions,
      kataList,
      
      incrementPunches,
      incrementKicks,
      addKata,
      startSession,
      endSession,
      resetCurrentSession
    }}>
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};