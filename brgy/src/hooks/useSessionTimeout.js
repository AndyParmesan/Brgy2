import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Custom hook to manage session timeout based on user activity
 * @param {Function} onTimeout - Callback when session times out
 */
export const useSessionTimeout = (onTimeout) => {
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity time
    lastActivityRef.current = Date.now();
    localStorage.setItem('last_activity', lastActivityRef.current.toString());

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Session expired
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      
      if (onTimeout) {
        onTimeout();
      }
    }, IDLE_TIMEOUT);
  }, [onTimeout]);

  const checkExistingSession = useCallback(() => {
    const lastActivity = localStorage.getItem('last_activity');
    const token = localStorage.getItem('auth_token');

    if (!token) {
      return false;
    }

    if (!lastActivity) {
      // No last activity recorded, set it now
      lastActivityRef.current = Date.now();
      localStorage.setItem('last_activity', lastActivityRef.current.toString());
      resetTimer();
      return true;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const timeSinceLastActivity = Date.now() - lastActivityTime;

    if (timeSinceLastActivity >= IDLE_TIMEOUT) {
      // Session has expired
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      
      if (onTimeout) {
        onTimeout();
      }
      return false;
    }

    // Session is still valid, reset timer
    lastActivityRef.current = lastActivityTime;
    resetTimer();
    return true;
  }, [resetTimer, onTimeout]);

  useEffect(() => {
    // Check session on mount
    const isValid = checkExistingSession();

    if (!isValid) {
      return;
    }

    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Also track visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to the tab, check if session is still valid
        checkExistingSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, checkExistingSession]);

  return { resetTimer, checkExistingSession };
};

