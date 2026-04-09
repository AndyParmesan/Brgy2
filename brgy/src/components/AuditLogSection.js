import { useState, useEffect } from 'react';

const AuditLogSection = ({ authToken }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    module: 'all',
    actor: '',
    dateFrom: '',
    dateTo: '',
    limit: 100
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.module !== 'all') params.append('module', filters.module);
      if (filters.actor) params.append('actor', filters.actor);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('limit', filters.limit);

      const response = await fetch(`/api/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load audit logs');
      }
    } catch (err) {
      setError('Failed to load audit logs. Please try again.');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
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

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('delete') || actionLower.includes('reject')) {
      return '#ef4444';
    } else if (actionLower.includes('create') || actionLower.includes('approve')) {
      return '#10b981';
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return '#3b82f6';
    }
    return '#6b7280';
  };

  const parseDetails = (details) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return parsed;
    } catch {
      return { details: details };
    }
  };

  const exportLogs = () => {
    setExporting(true);
    try {
      const csvHeaders = ['Timestamp', 'Actor', 'Action', 'Module', 'Reference ID', 'Details', 'IP Address', 'User Agent', 'Email', 'Role'];
      const csvRows = logs.map(log => {
        const detailsObj = parseDetails(log.details);
        const auditInfo = detailsObj?.audit || {};
        return [
          formatDateTime(log.logged_at || log.created_at),
          log.actor_name || 'N/A',
          log.action || 'N/A',
          log.module || 'N/A',
          log.reference_id || 'N/A',
          detailsObj?.details || detailsObj || 'N/A',
          auditInfo.ip || 'N/A',
          auditInfo.userAgent || 'N/A',
          auditInfo.email || 'N/A',
          auditInfo.role || 'N/A'
        ];
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export logs');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const moduleOptions = ['all', 'Document', 'Resident', 'Blotter', 'Announcement', 'User', 'System'];

  return (
    <section className="panel audit-log-module">
      <header className="panel-heading">
        <div>
          <h2>Audit Log</h2>
          <p className="muted">Complete transaction history and system activity for compliance and security</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="ghost-btn" 
            onClick={exportLogs}
            disabled={exporting || logs.length === 0}
          >
            {exporting ? 'Exporting...' : '📥 Export CSV'}
          </button>
          <button className="ghost-btn" onClick={fetchLogs}>
            🔄 Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="audit-filters" style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="filter-field">
            <label htmlFor="module-filter">Module</label>
            <select
              id="module-filter"
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              {moduleOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'All Modules' : opt}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="actor-filter">Actor</label>
            <input
              id="actor-filter"
              type="text"
              placeholder="Search by actor name"
              value={filters.actor}
              onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="date-from">Date From</label>
            <input
              id="date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="date-to">Date To</label>
            <input
              id="date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="limit-filter">Limit</label>
            <select
              id="limit-filter"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading audit logs...</div>
      ) : (
        <div className="audit-log-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Module</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Reference</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Details</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Audit Info</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const detailsObj = parseDetails(log.details);
                  const auditInfo = detailsObj?.audit || {};
                  return (
                    <tr 
                      key={log.id} 
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.logged_at || log.created_at)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                        {log.actor_name || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          color: getActionColor(log.action),
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          {log.action || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>{getModuleIcon(log.module)}</span>
                          <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>{log.module || 'N/A'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {log.reference_id ? (
                          <span style={{ 
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            background: '#eff6ff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {log.reference_id}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#4b5563', maxWidth: '300px' }}>
                        <div style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          title: detailsObj?.details || detailsObj || 'N/A'
                        }}>
                          {detailsObj?.details || detailsObj || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        {auditInfo.ip || auditInfo.email || auditInfo.role ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {auditInfo.ip && <span>IP: {auditInfo.ip}</span>}
                            {auditInfo.email && <span>Email: {auditInfo.email}</span>}
                            {auditInfo.role && <span>Role: {auditInfo.role}</span>}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', borderTop: '1px solid #e5e7eb' }}>
          Showing {logs.length} audit log{logs.length !== 1 ? 's' : ''}
        </div>
      )}
    </section>
  );
};

export default AuditLogSection;
