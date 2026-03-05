import { useState, useEffect, useCallback } from 'react';

const SESSION_TIME_KEY = 'zns_session_time';

export function useTimeTracker(moduleId?: string) {
  const [sessionTimeMs, setSessionTimeMs] = useState(0);
  const [moduleTimeMs, setModuleTimeMs] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_TIME_KEY);
    if (stored) {
      setSessionTimeMs(parseInt(stored, 10));
    }

    if (moduleId) {
      const moduleKey = `zns_time_module_${moduleId}`;
      const moduleStored = localStorage.getItem(moduleKey) || '0';
      setModuleTimeMs(parseInt(moduleStored, 10));
    }

    const interval = setInterval(() => {
      setSessionTimeMs((prev) => {
        const current = prev + 1000;
        localStorage.setItem(SESSION_TIME_KEY, current.toString());
        return current;
      });
      
      if (moduleId) {
        setModuleTimeMs((prev) => {
          const current = prev + 1000;
          const moduleKey = `zns_time_module_${moduleId}`;
          localStorage.setItem(moduleKey, current.toString());
          return current;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [moduleId]);

  const getModuleTime = useCallback((id: string) => {
    if (typeof window === 'undefined') return 0;
    const moduleKey = `zns_time_module_${id}`;
    const moduleStored = localStorage.getItem(moduleKey) || '0';
    return parseInt(moduleStored, 10);
  }, []);

  return { sessionTimeMs, moduleTimeMs, getModuleTime };
}
