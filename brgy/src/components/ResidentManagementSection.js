import { useState, useEffect } from 'react';

const ResidentManagementSection = ({ authToken }) => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_email: '',
    contact_mobile: '',
    address: '',
    zone: '',
    date_of_birth: '',
    gender: '',
    occupation: ''
  });

  useEffect(() => {
    fetchResidents();
  }, [searchTerm]);

  const fetchResidents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/residents?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResidents(data);
      } else {
        setError('Failed to load residents');
      }
    } catch (err) {
      setError('Failed to load residents. Please try again.');
      console.error('Error fetching residents:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCreate = () => {
    setFormData({
      full_name: '',
      contact_email: '',
      contact_mobile: '',
      address: '',
      zone: '',
      date_of_birth: '',
      gender: '',
      occupation: ''
    });
    setError('');
    setShowCreateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (!formData.full_name || !formData.contact_mobile || !formData.address) {
      setError('Full name, contact mobile, and address are required.');
      setSubmitting(false);
      return;
    }

    try {
      // Create resident in residents table
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          full_name: '',
          contact_email: '',
          contact_mobile: '',
          address: '',
          zone: '',
          date_of_birth: '',
          gender: '',
          occupation: ''
        });
        fetchResidents();
        alert('Resident created successfully!');
      } else {
        const errorMessage = data.message || data.error || 'Failed to create resident';
        setError(errorMessage);
        console.error('❌ Create resident error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create resident. Please check your connection and try again.';
      setError(errorMessage);
      console.error('❌ Network error creating resident:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resident? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from residents table
      const response = await fetch(`/api/residents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchResidents();
        alert('Resident deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete resident');
      }
    } catch (err) {
      alert('Failed to delete resident. Please try again.');
      console.error('Error deleting resident:', err);
    }
  };

  // Calculate stats
  const stats = {
    total: residents.length,
    withEmail: residents.filter(r => r.contact_email).length,
    byZone: {}
  };
  residents.forEach(r => {
    const zone = r.zone || 'Unknown';
    stats.byZone[zone] = (stats.byZone[zone] || 0) + 1;
  });

  return (
    <section className="panel resident-module">
      <header className="panel-heading">
        <div>
          <h2>Resident Management</h2>
          <p className="muted">Track resident files at a glance and inspect full profiles in one tap.</p>
        </div>
        <button className="primary-btn compact" onClick={handleCreate}>
          + Add Resident
        </button>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="resident-stats">
        <article>
          <p className="stat-label">Total Residents</p>
          <p className="stat-value">{stats.total}</p>
        </article>
        <article>
          <p className="stat-label">With Email</p>
          <p className="stat-value">{stats.withEmail}</p>
        </article>
        <article>
          <p className="stat-label">Zones</p>
          <p className="stat-value">{Object.keys(stats.byZone).length}</p>
        </article>
      </div>

      <div className="resident-filters">
        <div className="filter-field">
          <label htmlFor="resident-search">Search name or contact</label>
          <input
            id="resident-search"
            type="search"
            placeholder="e.g. Maria or contact number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading residents...</div>
      ) : (
        <div className="table" style={{ marginTop: '1.5rem' }}>
          <div className="table-row head">
            <span>Name</span>
            <span>Contact</span>
            <span>Email</span>
            <span>Address</span>
            <span>Zone</span>
            <span>Actions</span>
          </div>
          {residents.length === 0 ? (
            <div className="table-row">
              <span colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                {searchTerm ? 'No residents found matching your search' : 'No residents found. Add your first resident!'}
              </span>
            </div>
          ) : (
            residents.map((resident) => (
              <div key={resident.id} className="table-row">
                <span>{resident.full_name}</span>
                <span>{resident.contact_mobile || 'N/A'}</span>
                <span>{resident.contact_email || 'N/A'}</span>
                <span>{resident.address ? resident.address.substring(0, 30) + '...' : 'N/A'}</span>
                <span>{resident.zone || 'N/A'}</span>
                <span>
                  <button className="ghost-btn" onClick={() => handleDelete(resident.id)} style={{ color: '#ef4444' }}>
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3>Add New Resident</h3>
              <button className="modal-close" onClick={() => { setShowCreateModal(false); setError(''); }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 1.75rem' }}>
              {error && (
                <div className="error-message" style={{ margin: '1rem 0', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
                  {error}
                </div>
              )}
              <form id="resident-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="Full name"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Contact Mobile *</label>
                  <input
                    type="tel"
                    value={formData.contact_mobile}
                    onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })}
                    required
                    placeholder="09XX-XXX-XXXX"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="email@example.com"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Complete address"
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Zone</label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="Zone number"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Occupation"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              </form>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
              <button type="button" className="ghost-btn" onClick={() => { setShowCreateModal(false); setError(''); }}>
                Cancel
              </button>
              <button type="submit" form="resident-form" className="primary-btn" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Resident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResidentManagementSection;

