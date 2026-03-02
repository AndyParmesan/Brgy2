import { useState, useEffect } from 'react';

const DocumentRequestsSection = ({ authToken }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [searchTerm, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`http://127.0.0.1:3001/api/document-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError('Failed to load document requests');
      }
    } catch (err) {
      setError('Failed to load document requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/document-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusUpdate.status,
          notes: statusUpdate.notes
        }),
      });

      if (response.ok) {
        setShowStatusModal(false);
        setSelectedRequest(null);
        setStatusUpdate({ status: '', notes: '' });
        fetchRequests();
        alert('Document request updated successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update request');
      }
    } catch (err) {
      alert('Failed to update request. Please try again.');
      console.error('Error updating request:', err);
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
    if (statusLower === 'approved' || statusLower === 'completed') {
      return 'status-approved';
    } else if (statusLower === 'pending' || statusLower === 'review') {
      return 'status-pending';
    } else if (statusLower === 'rejected' || statusLower === 'cancelled') {
      return 'status-rejected';
    }
    return 'status-default';
  };

  const statusOptions = ['Pending', 'Review', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

  return (
    <section className="panel document-module">
      <header className="panel-heading">
        <div>
          <h2>Document Requests</h2>
          <p className="muted">Review requester details and process certificates with confidence.</p>
        </div>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="document-filters">
        <div className="filter-field">
          <label htmlFor="document-search">Search requester or reference ID</label>
          <input
            id="document-search"
            type="search"
            placeholder="e.g. Maria or DOC-2024-045"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
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
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading document requests...</div>
      ) : (
        <div className="document-table">
          <div className="document-row head">
            <span>Reference ID</span>
            <span>Requester</span>
            <span>Document</span>
            <span>Date Filed</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {requests.length === 0 ? (
            <div className="document-row">
              <span colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                No document requests found
              </span>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="document-row">
                <span>{request.reference_no || `DOC-${request.id}`}</span>
                <span>
                  <strong>{request.requester_name}</strong>
                  <small>{request.contact_number}</small>
                </span>
                <span>
                  {request.document_type}
                  {request.purpose && <small>{request.purpose}</small>}
                </span>
                <span>{formatDate(request.date_filed)}</span>
                <span>
                  <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status || 'Pending'}
                  </span>
                </span>
                <span>
                  {request.status === 'Pending' || request.status === 'Review' ? (
                    <button 
                      className="primary-btn" 
                      onClick={() => {
                        setSelectedRequest(request);
                        setStatusUpdate({ status: 'Approved', notes: request.notes || '' });
                        setShowStatusModal(true);
                      }}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Approve
                    </button>
                  ) : null}
                  <button 
                    className="ghost-btn" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setStatusUpdate({ status: request.status || 'Pending', notes: request.notes || '' });
                      setShowStatusModal(true);
                    }}
                  >
                    {request.status === 'Pending' || request.status === 'Review' ? 'Update' : 'Update Status'}
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showStatusModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3>Update Document Request Status</h3>
              <button className="modal-close" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}>×</button>
            </div>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                <p><strong>Reference:</strong> {selectedRequest.reference_no || `DOC-${selectedRequest.id}`}</p>
                <p><strong>Requester:</strong> {selectedRequest.requester_name}</p>
                <p><strong>Document:</strong> {selectedRequest.document_type}</p>
                <p><strong>Current Status:</strong> {selectedRequest.status || 'Pending'}</p>
              </div>
              <div className="form-group">
                <label>New Status *</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  placeholder="Add notes or comments"
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}>
                  Cancel
                </button>
                <button type="button" className="primary-btn" onClick={handleStatusUpdate} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentRequestsSection;
