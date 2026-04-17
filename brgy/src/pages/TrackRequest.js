import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './PublicPages.css'; // Assuming this holds your public page styles

const TrackRequest = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(null);

  // Smart input handler: auto-uppercase
  const handleInputChange = (e) => {
    let value = e.target.value.toUpperCase();
    // Optional: strip spaces
    value = value.replace(/\s/g, '');
    setTrackingId(value);
    
    // Clear errors when they start typing again
    if (error) setError('');
    if (requestData) setRequestData(null);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId) return;

    setLoading(true);
    setError('');
    setRequestData(null);

    // Smart logic: If they just typed numbers like "2024-045", safely append "DOC-"
    let finalId = trackingId;
    if (!finalId.startsWith('DOC-')) {
      finalId = `DOC-${finalId}`;
    }

    try {
      // Call the secure public tracking route we built in server.js
      const response = await fetch(`/api/public/track-document/${encodeURIComponent(finalId)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setRequestData(data.request);
        // Update the input field to show the proper format they just searched
        setTrackingId(finalId);
      } else {
        setError(data.message || 'Tracking ID not found. Please check your reference number.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code the status badge
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'review': return 'status-review';
      case 'approved': return 'status-approved';
      case 'ready': return 'status-ready'; // Assuming you have a 'ready for pickup' status
      default: return 'status-default';
    }
  };

  return (
    <div className="public-page">
      <Navigation />

      <section className="page-header">
        <div className="container">
          <h1>Track Document Request</h1>
          <p>Check the real-time status of your requested barangay documents</p>
        </div>
      </section>

      <section className="track-section" style={{ minHeight: '50vh', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div className="panel" style={{ padding: '2rem' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Reference Number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., DOC-2024-045"
                    value={trackingId}
                    onChange={handleInputChange}
                    style={{ flex: 1, padding: '1rem', fontSize: '1.2rem', textTransform: 'uppercase' }}
                    required
                  />
                  <button 
                    type="submit" 
                    className="primary-btn" 
                    disabled={loading || !trackingId}
                    style={{ padding: '0 2rem' }}
                  >
                    {loading ? 'Searching...' : 'Track'}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="error-message" style={{ marginTop: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {requestData && (
              <div className="tracking-result" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p className="muted" style={{ margin: 0, fontSize: '0.875rem' }}>Reference ID</p>
                    <h3 style={{ margin: 0 }}>{requestData.id}</h3>
                  </div>
                  <div>
                    <span className={`status-badge ${getStatusClass(requestData.status)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      {requestData.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p className="muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>Requested By</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{requestData.full_name}</p>
                    {/* The name is censored by the backend! (e.g., J***** P***) */}
                  </div>
                  <div>
                    <p className="muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>Document Type</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{requestData.document_type}</p>
                  </div>
                  <div>
                    <p className="muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>Purpose</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{requestData.purpose}</p>
                  </div>
                  <div>
                    <p className="muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>Date Filed</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>
                      {new Date(requestData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackRequest;