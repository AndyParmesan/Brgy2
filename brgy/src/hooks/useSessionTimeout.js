import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 15 * 60 * 1000; // 15 minutes before timeout

/**
 * Custom hook to manage session timeout based on user activity
 * @param {Function} onTimeout - Callback when session times out
 */
export const useSessionTimeout = (onTimeout) => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(WARNING_BEFORE_MS / 1000);
  
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setRemainingSeconds(WARNING_BEFORE_MS / 1000);

    lastActivityRef.current = Date.now();
    localStorage.setItem('last_activity', lastActivityRef.current.toString());

    // 1. Set the timer to trigger the warning
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      
      // Start countdown for the UI
      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // 2. Set the actual hard timeout
    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      setShowWarning(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      
      if (onTimeout) {
        onTimeout();
      }
    }, IDLE_TIMEOUT_MS);
  }, [onTimeout, clearAllTimers]);

  const checkExistingSession = useCallback(() => {
    const lastActivity = localStorage.getItem('last_activity');
    const token = localStorage.getItem('auth_token');

    if (!token) return false;

    if (!lastActivity) {
      lastActivityRef.current = Date.now();
      localStorage.setItem('last_activity', lastActivityRef.current.toString());
      resetTimer();
      return true;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const timeSinceLastActivity = Date.now() - lastActivityTime;

    if (timeSinceLastActivity >= IDLE_TIMEOUT_MS) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      if (onTimeout) onTimeout();
      return false;
    }

    lastActivityRef.current = lastActivityTime;
    resetTimer();
    return true;
  }, [resetTimer, onTimeout]);

  useEffect(() => {
    const isValid = checkExistingSession();
    if (!isValid) return;

    // Track user activity events to reset timers
    // Note: If the warning is already showing, we don't auto-reset on scroll/mousemove 
    // to force the user to click the "Continue Session" button so they are explicitly aware.
    const events = ['mousedown', 'keypress', 'touchstart', 'click'];
    
    const handleActivity = () => {
      // Auto-reset ONLY if the warning banner isn't currently up
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkExistingSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearAllTimers();
    };
  }, [resetTimer, checkExistingSession, showWarning, clearAllTimers]);

  return { showWarning, remainingSeconds, resetTimer };
};