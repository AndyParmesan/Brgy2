import { useState, useEffect } from 'react';

const StatisticsSection = ({ authToken }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:3001/api/statistics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError('Failed to load statistics. Please try again.');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="panel">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading statistics...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="panel">
        <div style={{ padding: '2rem', textAlign: 'center' }}>No statistics available</div>
      </section>
    );
  }

  return (
    <>
      <section className="panel reports-module">
        <header className="panel-heading">
          <div>
            <h2>Overview Statistics</h2>
            <p className="muted">Key metrics and system overview</p>
          </div>
        </header>
        <div className="reports-grid">
          <article className="report-card">
            <p className="stat-label">Total Residents</p>
            <p className="stat-value">{stats.overview.totalResidents.toLocaleString()}</p>
            <p className="muted">Registered in system</p>
          </article>
          <article className="report-card">
            <p className="stat-label">Total Households</p>
            <p className="stat-value">{stats.overview.totalHouseholds.toLocaleString()}</p>
            <p className="muted">Distinct addresses</p>
          </article>
          <article className="report-card">
            <p className="stat-label">Pending Requests</p>
            <p className="stat-value">{stats.overview.pendingRequests}</p>
            <p className="muted">Document requests</p>
          </article>
          <article className="report-card">
            <p className="stat-label">Active Blotters</p>
            <p className="stat-value">{stats.overview.activeBlotterCases}</p>
            <p className="muted">Cases in progress</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <header className="panel-heading">
          <div>
            <h2>Document Requests Statistics</h2>
            <p className="muted">Breakdown by status and type</p>
          </div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>By Status</h3>
            <div className="table">
              <div className="table-row head">
                <span>Status</span>
                <span>Count</span>
              </div>
              {Object.entries(stats.documentRequests.byStatus).map(([status, count]) => (
                <div key={status} className="table-row">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>By Document Type</h3>
            <div className="table">
              <div className="table-row head">
                <span>Document Type</span>
                <span>Count</span>
              </div>
              {stats.documentRequests.byType.map((item) => (
                <div key={item.document_type} className="table-row">
                  <span>{item.document_type}</span>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel-heading">
          <div>
            <h2>Blotter Cases Statistics</h2>
            <p className="muted">Breakdown by status and category</p>
          </div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>By Status</h3>
            <div className="table">
              <div className="table-row head">
                <span>Status</span>
                <span>Count</span>
              </div>
              {Object.entries(stats.blotterCases.byStatus).map(([status, count]) => (
                <div key={status} className="table-row">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>By Category</h3>
            <div className="table">
              <div className="table-row head">
                <span>Category</span>
                <span>Count</span>
              </div>
              {stats.blotterCases.byCategory.map((item) => (
                <div key={item.category} className="table-row">
                  <span>{item.category}</span>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel trend-module">
        <header className="panel-heading">
          <div>
            <h2>Recent Activity (Last 7 Days)</h2>
            <p className="muted">New entries in the past week</p>
          </div>
        </header>
        <div className="reports-grid" style={{ marginTop: '1.5rem' }}>
          <article className="report-card">
            <p className="stat-label">New Documents</p>
            <p className="stat-value">{stats.documentRequests.recent}</p>
            <p className="muted">Last 7 days</p>
          </article>
          <article className="report-card">
            <p className="stat-label">New Blotters</p>
            <p className="stat-value">{stats.blotterCases.recent}</p>
            <p className="muted">Last 7 days</p>
          </article>
          <article className="report-card">
            <p className="stat-label">New Residents</p>
            <p className="stat-value">{stats.residents.recent}</p>
            <p className="muted">Last 7 days</p>
          </article>
        </div>
      </section>
    </>
  );
};

export default StatisticsSection;

