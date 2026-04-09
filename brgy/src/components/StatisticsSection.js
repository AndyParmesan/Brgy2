import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

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
      const response = await fetch('/api/statistics', {
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

  // Format data for Recharts
  const docStatusData = Object.entries(stats.documentRequests.byStatus).map(([name, value]) => ({ name, value }));
  const blotterStatusData = Object.entries(stats.blotterCases.byStatus).map(([name, value]) => ({ name, value }));

  return (
    <>
      {/* OVERVIEW CARDS */}
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

      {/* DOCUMENT REQUESTS CHARTS */}
      <section className="panel">
        <header className="panel-heading">
          <div>
            <h2>Document Requests Breakdown</h2>
            <p className="muted">Visualizing request volumes by status and type</p>
          </div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          
          {/* Status Pie Chart */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1rem' }}>Requests by Status</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={docStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {docStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Type Bar Chart */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1rem' }}>Requests by Document Type</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.documentRequests.byType} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="document_type" tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* BLOTTER CASES CHARTS */}
      <section className="panel">
        <header className="panel-heading">
          <div>
            <h2>Blotter Cases Breakdown</h2>
            <p className="muted">Visualizing dispute records by status and category</p>
          </div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          
          {/* Status Pie Chart */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1rem' }}>Cases by Status</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={blotterStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {blotterStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Bar Chart */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1rem' }}>Cases by Category</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.blotterCases.byCategory} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDS */}
      <section className="panel trend-module">
        <header className="panel-heading">
          <div>
            <h2>Recent Activity (Last 7 Days)</h2>
            <p className="muted">New entries processed in the past week</p>
          </div>
        </header>
        <div className="reports-grid" style={{ marginTop: '1.5rem' }}>
          <article className="report-card" style={{ borderTop: '4px solid #3b82f6' }}>
            <p className="stat-label">New Documents</p>
            <p className="stat-value">{stats.documentRequests.recent}</p>
            <p className="muted">Filed in last 7 days</p>
          </article>
          <article className="report-card" style={{ borderTop: '4px solid #ef4444' }}>
            <p className="stat-label">New Blotters</p>
            <p className="stat-value">{stats.blotterCases.recent}</p>
            <p className="muted">Filed in last 7 days</p>
          </article>
          <article className="report-card" style={{ borderTop: '4px solid #10b981' }}>
            <p className="stat-label">New Residents</p>
            <p className="stat-value">{stats.residents.recent}</p>
            <p className="muted">Registered in last 7 days</p>
          </article>
        </div>
      </section>
    </>
  );
};

export default StatisticsSection;