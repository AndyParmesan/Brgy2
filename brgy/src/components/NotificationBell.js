// NotificationBell.js
// ─── FIX: Hardcoded notification badge "2" ───────────────────────────────────
// Replaces the static bell with a live-polling component that:
//   • Fetches real unread counts from the backend every 60 seconds
//   • Shows a breakdown dropdown (pending docs, new blotters, new contacts)
//   • Badge disappears when count reaches 0
//   • Each item links to the relevant admin section
//   • "Mark all read" clears the badge until new items arrive
//
// HOW TO USE — replace wherever the bell is rendered in your layout:
//
//   import NotificationBell from './NotificationBell';
//   ...
//   <NotificationBell authToken={authToken} onNavigate={setActiveSection} />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL_MS = 60_000; // re-fetch every 60 seconds

export default function NotificationBell({ authToken, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    // Persist "last seen" across page refreshes so the badge is accurate
    return localStorage.getItem('brgy_notif_last_seen') || new Date(0).toISOString();
  });
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);

  // ── Fetch notification data from the backend ────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      };

      // Run all three fetches in parallel
      const [docsRes, blotterRes, contactRes] = await Promise.allSettled([
        fetch('/api/document-requests?status=Pending&limit=50', { headers }),
        fetch('/api/blotter-cases?status=Filed&limit=50', { headers }),
        fetch('/api/contact-messages?status=Unread&limit=50', { headers }),
      ]);

      const items = [];

      // Pending document requests
      if (docsRes.status === 'fulfilled' && docsRes.value.ok) {
        const docs = await docsRes.value.json();
        const pending = Array.isArray(docs) ? docs : [];
        const newPending = pending.filter(d => new Date(d.date_filed) > new Date(lastSeenAt));
        if (pending.length > 0) {
          items.push({
            id: 'pending-docs',
            icon: '📄',
            label: `${pending.length} pending document request${pending.length !== 1 ? 's' : ''}`,
            sublabel: newPending.length > 0 ? `${newPending.length} new since last visit` : 'No new since last visit',
            isNew: newPending.length > 0,
            section: 'document-requests',
            count: pending.length,
          });
        }
      }

      // Newly filed blotter cases
      if (blotterRes.status === 'fulfilled' && blotterRes.value.ok) {
        const blotters = await blotterRes.value.json();
        const filed = Array.isArray(blotters) ? blotters : [];
        const newFiled = filed.filter(b => new Date(b.date_filed || b.created_at) > new Date(lastSeenAt));
        if (filed.length > 0) {
          items.push({
            id: 'blotter-filed',
            icon: '⚖️',
            label: `${filed.length} active blotter case${filed.length !== 1 ? 's' : ''}`,
            sublabel: newFiled.length > 0 ? `${newFiled.length} new since last visit` : 'No new since last visit',
            isNew: newFiled.length > 0,
            section: 'blotter',
            count: filed.length,
          });
        }
      }

      // Unread contact messages
      if (contactRes.status === 'fulfilled' && contactRes.value.ok) {
        const contacts = await contactRes.value.json();
        const unread = Array.isArray(contacts) ? contacts : [];
        if (unread.length > 0) {
          items.push({
            id: 'contact-unread',
            icon: '✉️',
            label: `${unread.length} unread message${unread.length !== 1 ? 's' : ''}`,
            sublabel: 'From the public contact form',
            isNew: true,
            section: 'contact',
            count: unread.length,
          });
        }
      }

      setNotifications(items);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [authToken, lastSeenAt]);

  // ── Poll on mount and every 60s ─────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
    timerRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchNotifications]);

  // ── Close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Derived state ───────────────────────────────────────────────────────
  const totalCount = notifications.reduce((sum, n) => sum + n.count, 0);
  const hasNew = notifications.some(n => n.isNew);

  // ── Mark all as read ────────────────────────────────────────────────────
  const markAllRead = () => {
    const now = new Date().toISOString();
    setLastSeenAt(now);
    localStorage.setItem('brgy_notif_last_seen', now);
    // Re-fetch so isNew flags update
    setTimeout(fetchNotifications, 100);
  };

// ── Navigate to section ─────────────────────────────────────────────────
  const handleItemClick = (section) => {
    setOpen(false); // Close the dropdown

    // If a specific section string is passed, force the hash route
    if (section) {
      if (section === 'document-requests') {
        window.location.hash = '#document-requests';
      } else if (section === 'blotter') {
        window.location.hash = '#blotter-disputes';
      } else if (section === 'contact') {
        window.location.hash = '#contact-messages'; // Or whatever your contact hash is
      } else {
        window.location.hash = `#${section}`;
      }
    }

    // Call the original onNavigate just in case your parent component needs it to update state
    if (onNavigate) onNavigate(section);
  };
  
  // ── Styles ──────────────────────────────────────────────────────────────
  const wrapStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const bellBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'background 0.15s',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #fff',
    lineHeight: 1,
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#fff',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    border: '1px solid #e5e7eb',
    minWidth: '320px',
    zIndex: 1000,
    overflow: 'hidden',
  };

  return (
    <div style={wrapStyle} ref={dropdownRef}>
      {/* Bell button */}
      <button
        style={bellBtnStyle}
        onClick={() => setOpen(prev => !prev)}
        title={totalCount > 0 ? `${totalCount} notifications` : 'No notifications'}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {/* Bell SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={hasNew ? '#f59e0b' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Live badge — only shown when totalCount > 0 */}
        {totalCount > 0 && (
          <span style={badgeStyle}>
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div style={{
            padding: '0.875rem 1rem',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
              Notifications {loading && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>↻</span>}
            </span>
            {hasNew && (
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Items */}
          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>All caught up!</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem' }}>No pending items right now.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleItemClick(notif.section)}
                  style={{
                    width: '100%',
                    background: notif.isNew ? '#fffbeb' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = notif.isNew ? '#fffbeb' : 'transparent'}
                >
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{notif.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                      {notif.label}
                      {notif.isNew && (
                        <span style={{
                          marginLeft: '0.5rem',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          verticalAlign: 'middle',
                        }}>NEW</span>
                      )}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
                      {notif.sublabel}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0, marginTop: '0.2rem' }}>→</span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '0.625rem 1rem',
            borderTop: '1px solid #f3f4f6',
            textAlign: 'center',
          }}>
            <button
              onClick={fetchNotifications}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              ↺ Refresh
            </button>
            <span style={{ color: '#e5e7eb', margin: '0 0.5rem' }}>|</span>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
              Auto-updates every 60s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
