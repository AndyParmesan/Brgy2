import { useState, useEffect } from 'react';

const BlotterManagementSection = ({ authToken }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [caseUpdate, setCaseUpdate] = useState({ 
    status: '', 
    priority: '', 
    notes: '', 
    investigator_name: '', 
    next_hearing_date: '' 
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [searchTerm, statusFilter]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/blotter-cases?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data);
      } else {
        setError('Failed to load blotter cases');
      }
    } catch (err) {
      setError('Failed to load blotter cases. Please try again.');
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseUpdate = async () => {
    if (!caseUpdate.status) {
      alert('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/blotter-cases/${selectedCase.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseUpdate),
      });

      if (response.ok) {
        setShowStatusModal(false);
        setSelectedCase(null);
        setCaseUpdate({ status: '', priority: '', notes: '', investigator_name: '', next_hearing_date: '' });
        fetchCases();
        alert('Blotter case updated successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update case');
      }
    } catch (err) {
      alert('Failed to update case. Please try again.');
      console.error('Error updating case:', err);
    } finally {
      setUpdating(false);
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

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'resolved' || statusLower === 'closed') {
      return 'status-approved';
    } else if (statusLower === 'pending' || statusLower === 'in progress') {
      return 'status-pending';
    } else if (statusLower === 'cancelled') {
      return 'status-rejected';
    }
    return 'status-default';
  };

  const statusOptions = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];
  const priorityOptions = ['Low', 'Normal', 'High'];

  // Calculate stats
  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'Pending').length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    resolved: cases.filter(c => c.status === 'Resolved').length
  };

  return (
    <section className="panel blotter-module">
      <header className="panel-heading">
        <div>
          <h2>Blotter & Disputes</h2>
          <p className="muted">Triage disputes, coordinate hearings, and capture mediation notes.</p>
        </div>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="blotter-stats">
        <article>
          <p className="stat-label">Total Cases</p>
          <p className="stat-value">{stats.total}</p>
        </article>
        <article>
          <p className="stat-label">Pending</p>
          <p className="stat-value">{stats.pending}</p>
        </article>
        <article>
          <p className="stat-label">In Progress</p>
          <p className="stat-value">{stats.inProgress}</p>
        </article>
        <article>
          <p className="stat-label">Resolved</p>
          <p className="stat-value">{stats.resolved}</p>
        </article>
      </div>

      <div className="blotter-filters">
        <div className="filter-field">
          <label htmlFor="blotter-search">Search case ID, name, or location</label>
          <input
            id="blotter-search"
            type="search"
            placeholder="e.g. BR-2024-012 or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="blotter-status">Status</label>
          <select
            id="blotter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading blotter cases...</div>
      ) : (
        <div className="blotter-table">
          <div className="blotter-row head">
            <span>Case No</span>
            <span>Case Title</span>
            <span>Category</span>
            <span>Date Reported</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {cases.length === 0 ? (
            <div className="blotter-row">
              <span colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                No blotter cases found
              </span>
            </div>
          ) : (
            cases.map((case_) => (
              <div key={case_.id} className="blotter-row">
                <span>{case_.case_no || `BR-${case_.id}`}</span>
                <span>{case_.case_title || case_.category}</span>
                <span>{case_.category || 'N/A'}</span>
                <span>{formatDate(case_.date_reported)}</span>
                <span>
                  <span className={`status-badge ${getStatusBadgeClass(case_.status)}`}>
                    {case_.status || 'Pending'}
                  </span>
                </span>
                <span>
                  <button 
                    className="ghost-btn" 
                    onClick={() => {
                      setSelectedCase(case_);
                      setCaseUpdate({ 
                        status: case_.status || 'Pending', 
                        priority: case_.priority || 'Normal',
                        notes: case_.notes || '',
                        investigator_name: case_.investigator_name || '',
                        next_hearing_date: case_.next_hearing_date ? case_.next_hearing_date.split('T')[0] : ''
                      });
                      setShowStatusModal(true);
                    }}
                  >
                    Process
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showStatusModal && selectedCase && (
        <div className="modal-overlay" onClick={() => { setShowStatusModal(false); setSelectedCase(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Process Blotter Case</h3>
              <button className="modal-close" onClick={() => { setShowStatusModal(false); setSelectedCase(null); }}>×</button>
            </div>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                <p><strong>Case No:</strong> {selectedCase.case_no || `BR-${selectedCase.id}`}</p>
                <p><strong>Title:</strong> {selectedCase.case_title}</p>
                <p><strong>Reporter:</strong> {selectedCase.reporter_name}</p>
                <p><strong>Location:</strong> {selectedCase.location}</p>
                <p><strong>Description:</strong> {selectedCase.description}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={caseUpdate.status}
                    onChange={(e) => setCaseUpdate({ ...caseUpdate, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={caseUpdate.priority}
                    onChange={(e) => setCaseUpdate({ ...caseUpdate, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Investigator Name</label>
                <input
                  type="text"
                  value={caseUpdate.investigator_name}
                  onChange={(e) => setCaseUpdate({ ...caseUpdate, investigator_name: e.target.value })}
                  placeholder="Assigned investigator"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Next Hearing Date</label>
                <input
                  type="date"
                  value={caseUpdate.next_hearing_date}
                  onChange={(e) => setCaseUpdate({ ...caseUpdate, next_hearing_date: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={caseUpdate.notes}
                  onChange={(e) => setCaseUpdate({ ...caseUpdate, notes: e.target.value })}
                  placeholder="Add processing notes"
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={() => { setShowStatusModal(false); setSelectedCase(null); }}>
                  Cancel
                </button>
                <button type="button" className="primary-btn" onClick={handleCaseUpdate} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlotterManagementSection;

