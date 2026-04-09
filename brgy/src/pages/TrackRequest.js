import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './PublicPages.css'; // Assuming you use this for public page styling

const TrackRequest = () => {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // We will create this public API endpoint next
      const response = await fetch(`http://127.0.0.1:3001/api/public/track-document/${trackingId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.request);
      } else {
        setError(data.message || 'Could not find a request with that ID.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code the status badge
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#10b981'; // Green
      case 'pending': return '#f59e0b'; // Yellow
      case 'rejected': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div className="landing-page">
      <Navigation />
      
      <main className="main-content" style={{ minHeight: '60vh', padding: '4rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', width: '100%', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' }}>Track Document Request</h2>
          
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
            Enter your Request ID below to check the current status of your document.
          </p>

          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="e.g. 15"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{result.document_type}</h3>
                <span style={{ 
                  background: getStatusColor(result.status), 
                  color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'capitalize' 
                }}>
                  {result.status}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#4b5563' }}><strong>Resident:</strong> {result.full_name}</p>
              <p style={{ margin: '0.5rem 0', color: '#4b5563' }}><strong>Date Requested:</strong> {new Date(result.created_at).toLocaleDateString()}</p>
              {result.purpose && (
                <p style={{ margin: '0.5rem 0', color: '#4b5563' }}><strong>Purpose:</strong> {result.purpose}</p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackRequest;