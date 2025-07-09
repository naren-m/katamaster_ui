import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { sampleData } from '../data/sampleData';
import { TechniqueLog, TECHNIQUES } from '../types/techniques';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

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
  techniques: TechniqueLog[];
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
  kataObjects: any[];
  
  incrementPunches: () => void;
  incrementKicks: () => void;
  addKata: (kataName: string, repetitions: number) => void;
  startSession: () => void;
  endSession: () => Promise<number>;
  resetCurrentSession: () => void;
  incrementTechnique: (techniqueId: string) => void;
  getTechniqueCount: (techniqueId: string) => number;
};

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentPunches, setCurrentPunches] = useState(0);
  const [currentKicks, setCurrentKicks] = useState(0);
  const [currentKatas, setCurrentKatas] = useState<Kata[]>([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [currentTechniques, setCurrentTechniques] = useState<TechniqueLog[]>([]);
  
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalPunches, setTotalPunches] = useState(0);
  const [totalKicks, setTotalKicks] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [favoriteKata, setFavoriteKata] = useState('Heian Shodan');
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [kataList, setKataList] = useState<string[]>([]);
  const [kataObjects, setKataObjects] = useState<any[]>([]);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Load real data from API on component mount
  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Always load available katas (doesn't require authentication)
        console.log('Loading katas from API...');
        const katasData = await apiService.getKatas();
        console.log('Katas API response:', katasData);
        
        if (katasData && katasData.katas && Array.isArray(katasData.katas)) {
          const kataNames = katasData.katas.map((kata: any) => kata.name);
          console.log('Extracted kata names:', kataNames);
          setKataList(kataNames);
          setKataObjects(katasData.katas);
        } else {
          console.warn('Invalid katas data structure:', katasData);
          // Use fallback data
          setKataList(['Heian Shodan', 'Heian Nidan', 'Heian Sandan']);
          setKataObjects([]);
        }

        // Load user-specific data only if authenticated
        if (user?.id) {
          try {
            // Load user progress/stats
            console.log('Loading user progress for:', user.id);
            const userStats = await apiService.getUserProgress(user.id);
            console.log('User stats response:', userStats);
            
            setTotalPoints(userStats.total_points || 0);
            setCurrentStreak(userStats.current_streak || 0);
            setTotalPunches(userStats.total_punches || 0);
            setTotalKicks(userStats.total_kicks || 0);
            setTotalSessions(userStats.total_sessions || 0);
            setFavoriteKata(userStats.favorite_kata || 'Heian Shodan');

            // Load practice history for recent sessions
            console.log('Loading practice history...');
            const historyData = await apiService.getPracticeHistory(user.id, 1, 10);
            console.log('Practice history response:', historyData);
            
            if (historyData && historyData.practice_history && Array.isArray(historyData.practice_history)) {
              const sessions: Session[] = historyData.practice_history.map((entry: any, index: number) => ({
                id: index + 1,
                date: entry.date,
                punches: entry.punches || 0,
                kicks: entry.kicks || 0,
                duration: entry.duration_minutes || 0,
                katas: entry.katas?.map((k: any) => `${k.name} x${k.repetitions}`) || [],
                pointsEarned: entry.points_earned || 0,
                techniques: entry.techniques || []
              }));
              setRecentSessions(sessions);
            }
          } catch (userError) {
            console.error('Failed to load user-specific data:', userError);
          }
        }
      } catch (error) {
        console.error('Failed to load real data, using defaults:', error);
        // Keep default values if API fails
      }
    };

    loadRealData();
  }, [user]);

  const incrementPunches = () => {
    setCurrentPunches(prev => prev + 1);
  };

  const incrementKicks = () => {
    setCurrentKicks(prev => prev + 1);
  };

  const incrementTechnique = (techniqueId: string) => {
    setCurrentTechniques(prev => {
      const existing = prev.find(t => t.techniqueId === techniqueId);
      if (existing) {
        return prev.map(t => 
          t.techniqueId === techniqueId 
            ? { ...t, count: t.count + 1 }
            : t
        );
      }
      return [...prev, { techniqueId, count: 1, timestamp: new Date() }];
    });
  };

  const getTechniqueCount = (techniqueId: string): number => {
    return currentTechniques.find(t => t.techniqueId === techniqueId)?.count || 0;
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

  const updateStreak = async (newSessionDate: string) => {
    try {
      // Get fresh user stats which includes real streak calculation
      const userStats = await apiService.getUserProgress('user1');
      return userStats.current_streak || 0;
    } catch (error) {
      console.error('Failed to get updated streak:', error);
      // Fallback: simple increment if same day practice, else reset
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
    }
  };

  const endSession = async () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsSessionActive(false);
    
    // Calculate points earned
    const punchPoints = Math.floor(currentPunches / 10);
    const kickPoints = Math.floor(currentKicks / 10);
    const kataPoints = currentKatas.reduce((sum, kata) => sum + (kata.repetitions * 5), 0);
    const techniquePoints = currentTechniques.reduce((sum, technique) => {
      const techDef = TECHNIQUES.find(t => t.id === technique.techniqueId);
      return sum + (techDef ? techDef.points * technique.count : 0);
    }, 0);
    
    const pointsEarned = 10 + punchPoints + kickPoints + kataPoints + techniquePoints;
    
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
      pointsEarned,
      techniques: currentTechniques
    };
    
    // Record comprehensive session in backend
    try {
      await apiService.recordComprehensivePracticeSession({
        userId: user?.id || 'guest', // Use authenticated user ID
        sessionDate: today,
        durationMinutes: Math.floor(sessionTimer / 60),
        punches: currentPunches,
        kicks: currentKicks,
        katas: currentKatas,
        techniques: currentTechniques.map(t => ({
          techniqueId: t.techniqueId,
          count: t.count
        })),
        notes: `Practice session: ${currentKatas.length} katas, ${currentPunches} punches, ${currentKicks} kicks, ${currentTechniques.length} techniques`,
        pointsEarned: pointsEarned
      });
      
      console.log('✅ Comprehensive practice session recorded to database');
    } catch (error) {
      console.error('❌ Failed to record session to database:', error);
    }
    
    // Update local state
    setRecentSessions(prev => [newSession, ...prev]);
    setTotalPoints(prev => prev + pointsEarned);
    setTotalPunches(prev => prev + currentPunches);
    setTotalKicks(prev => prev + currentKicks);
    setTotalSessions(prev => prev + 1);
    
    // Update streak with real calculation
    const newStreak = await updateStreak(today);
    setCurrentStreak(newStreak);
    
    // Reset current session
    resetCurrentSession();
    
    return pointsEarned;
  };

  const resetCurrentSession = () => {
    setCurrentPunches(0);
    setCurrentKicks(0);
    setCurrentKatas([]);
    setCurrentTechniques([]);
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
      kataObjects,
      
      incrementPunches,
      incrementKicks,
      addKata,
      startSession,
      endSession,
      resetCurrentSession,
      incrementTechnique,
      getTechniqueCount
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