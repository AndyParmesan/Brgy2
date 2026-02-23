import { useState, useEffect } from 'react';

const DashboardOverviewSection = ({ authToken }) => {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsResponse = await fetch('http://127.0.0.1:3001/api/statistics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent pending document requests
      const docsResponse = await fetch('http://127.0.0.1:3001/api/document-requests?status=Pending&limit=5', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setRecentDocs(Array.isArray(docsData) ? docsData.slice(0, 5) : []);
      }

      // Fetch activity logs
      const logsResponse = await fetch('http://127.0.0.1:3001/api/activity-logs?limit=20', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setActivityLogs(Array.isArray(logsData) ? logsData : []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getModuleIcon = (module) => {
    const icons = {
      'Document': '📄',
      'Resident': '👥',
      'Blotter': '⚖️',
      'Announcement': '📢',
      'User': '👤',
      'System': '⚙️'
    };
    return icons[module] || '📋';
  };

  if (loading) {
    return (
      <section className="panel">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>
      </section>
    );
  }

  return (
    <>
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon">👥</div>
          <p className="stat-label">Total Residents</p>
          <p className="stat-value">{stats?.overview?.totalResidents || 0}</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon">📄</div>
          <p className="stat-label">Pending Requests</p>
          <p className="stat-value">{stats?.overview?.pendingRequests || 0}</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon">⚖️</div>
          <p className="stat-label">Active Blotters</p>
          <p className="stat-value">{stats?.overview?.activeBlotterCases || 0}</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon">🏠</div>
          <p className="stat-label">Households</p>
          <p className="stat-value">{stats?.overview?.totalHouseholds || 0}</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <header className="panel-heading">
            <div>
              <h2>Pending Requests</h2>
              <p className="muted">Monitor applications that need review</p>
            </div>
            <button className="text-link" onClick={() => window.location.hash = '#document-requests'}>View all</button>
          </header>

          <div className="table">
            <div className="table-row head">
              <span>Requester Name</span>
              <span>Document Type</span>
              <span>Date Filed</span>
              <span>Status</span>
            </div>

            {recentDocs.length === 0 ? (
              <div className="table-row">
                <span colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                  No pending requests
                </span>
              </div>
            ) : (
              recentDocs.map((request) => (
                <div key={request.id} className="table-row">
                  <span>{request.requester_name}</span>
                  <span>{request.document_type}</span>
                  <span>{formatDate(request.date_filed)}</span>
                  <span>
                    <span className={`status-badge ${request.status?.toLowerCase() || 'pending'}`}>
                      {request.status || 'Pending'}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel">
          <header className="panel-heading">
            <div>
              <h2>Activity Log</h2>
              <p className="muted">Recent system transactions</p>
            </div>
            <button className="text-link" onClick={fetchDashboardData}>Refresh</button>
          </header>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {activityLogs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                No activity logs available
              </div>
            ) : (
              <div style={{ padding: '0.5rem 0' }}>
                {activityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                      {getModuleIcon(log.module)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#1f2937' }}>{log.actor_name}</strong>
                        <span style={{ color: '#4b5563' }}>{log.action}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{log.module}</span>
                        {log.reference_id && (
                          <span style={{ 
                            color: '#3b82f6', 
                            fontSize: '0.75rem', 
                            fontFamily: 'monospace',
                            background: '#eff6ff',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {log.reference_id}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p style={{ 
                          margin: '0.25rem 0 0 0', 
                          color: '#6b7280', 
                          fontSize: '0.875rem',
                          wordBreak: 'break-word'
                        }}>
                          {log.details}
                        </p>
                      )}
                      <div style={{ 
                        marginTop: '0.25rem', 
                        fontSize: '0.75rem', 
                        color: '#9ca3af' 
                      }}>
                        {formatDateTime(log.logged_at || log.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
};

export default DashboardOverviewSection;

