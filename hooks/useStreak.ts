import { useState, useEffect, useCallback } from 'react';

const STREAK_STORAGE_KEY = 'zns_learning_streak';

interface StreakData {
  currentStreak: number;
  lastActivityDate: string | null;
  tasksCompletedToday: number;
  tasksCompletedYesterday: number;
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>({ 
    currentStreak: 0, 
    lastActivityDate: null,
    tasksCompletedToday: 0,
    tasksCompletedYesterday: 0
  });
  const [isAtRisk, setIsAtRisk] = useState(false);
  const [hasActedToday, setHasActedToday] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        let data: StreakData = {
          currentStreak: parsed.currentStreak || 0,
          lastActivityDate: parsed.lastActivityDate || null,
          tasksCompletedToday: parsed.tasksCompletedToday || 0,
          tasksCompletedYesterday: parsed.tasksCompletedYesterday || 0
        };
        
        const todayStr = new Date().toLocaleDateString('en-CA');
        
        // Let's store when we last checked to handle day rollovers without losing yesterday's tasks
        const lastCheckedStr = localStorage.getItem(`${STREAK_STORAGE_KEY}_last_check`);
        if (lastCheckedStr && lastCheckedStr !== todayStr) {
          const lastDate = new Date(lastCheckedStr);
          const currentDate = new Date(todayStr);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            data.tasksCompletedYesterday = data.tasksCompletedToday;
          } else {
            data.tasksCompletedYesterday = 0;
          }
          data.tasksCompletedToday = 0;
          
          // Also, if the streak is broken (diffDays from last activity > 1)
          if (data.lastActivityDate) {
              const actDate = new Date(data.lastActivityDate);
              const actDiff = Math.abs(currentDate.getTime() - actDate.getTime());
              const actDiffDays = Math.round(actDiff / (1000 * 60 * 60 * 24));
              if (actDiffDays > 1) {
                  data.currentStreak = 0;
              }
          }

          localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
        }
        localStorage.setItem(`${STREAK_STORAGE_KEY}_last_check`, todayStr);
        
        setStreakData(data);
        checkRisk(data);
      } catch (e) {
        console.error('Failed to parse streak data', e);
      }
    } else {
        localStorage.setItem(`${STREAK_STORAGE_KEY}_last_check`, new Date().toLocaleDateString('en-CA'));
    }
  }, []);

  const checkRisk = (data: StreakData) => {
    if (!data.lastActivityDate || data.currentStreak === 0) {
      setIsAtRisk(false);
      setHasActedToday(false);
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    const isToday = data.lastActivityDate === todayStr;
    
    setHasActedToday(isToday);
    
    if (!isToday && data.currentStreak > 0) {
      setIsAtRisk(true);
    } else {
      setIsAtRisk(false);
    }
  };

  const logActivity = useCallback((isTaskCompletion = false) => {
    if (!isTaskCompletion) return; // Only log task completions
    
    const todayStr = new Date().toLocaleDateString('en-CA');
    setStreakData((prev) => {
      let newStreak = prev.currentStreak;
      let newTasksToday = prev.tasksCompletedToday;
      let newTasksYesterday = prev.tasksCompletedYesterday;
      
      if (!prev.lastActivityDate) {
        newStreak = 1;
        newTasksToday = 1;
      } else {
        const lastDate = new Date(prev.lastActivityDate);
        const currentDate = new Date(todayStr);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 0) {
          // Same day
          newTasksToday += 1;
        } else if (diffDays === 1) {
          // Continuous
          newTasksYesterday = prev.tasksCompletedToday;
          newStreak += 1;
          newTasksToday = 1;
        } else if (diffDays > 1) {
          // Broken streak
          newTasksYesterday = 0;
          newStreak = 1;
          newTasksToday = 1;
        }
      }
      
      const newData = { 
        currentStreak: newStreak, 
        lastActivityDate: todayStr,
        tasksCompletedToday: newTasksToday,
        tasksCompletedYesterday: newTasksYesterday
      };
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newData));
      setIsAtRisk(false);
      setHasActedToday(true);
      return newData;
    });
  }, []);

  return { 
    currentStreak: streakData.currentStreak, 
    tasksCompletedToday: streakData.tasksCompletedToday,
    tasksCompletedYesterday: streakData.tasksCompletedYesterday,
    isAtRisk, 
    hasActedToday,
    logActivity 
  };
}
