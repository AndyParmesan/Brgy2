import { useState, useEffect, useCallback } from 'react';

// NEW: Added timeoutSetting parameter (defaults to 30m)
export const useSessionTimeout = (onTimeout, timeoutSetting = '30m') => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  // Convert string to actual milliseconds
  const getTimeoutMs = (setting) => {
    if (setting === '15m') return 15 * 60 * 1000;
    if (setting === '1h') return 60 * 60 * 1000;
    return 30 * 60 * 1000; // Default 30m
  };

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  useEffect(() => {
    let interval;
    const checkActivity = () => {
      const lastActivity = parseInt(localStorage.getItem('last_activity') || Date.now());
      const timeoutMs = getTimeoutMs(timeoutSetting); 
      const warningThreshold = 60 * 1000; // 1 minute warning
      
      const timePassed = Date.now() - lastActivity;
      const timeLeft = timeoutMs - timePassed;

      if (timeLeft <= 0) {
        onTimeout();
      } else if (timeLeft <= warningThreshold) {
        setShowWarning(true);
        setRemainingSeconds(Math.ceil(timeLeft / 1000));
      } else {
        setShowWarning(false);
      }
    };

    const handleActivity = () => localStorage.setItem('last_activity', Date.now().toString());
    
    // Listen for any user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    interval = setInterval(checkActivity, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [onTimeout, timeoutSetting]); // Re-run if setting changes

  return { showWarning, remainingSeconds, resetTimer };
};