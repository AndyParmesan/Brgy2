import React, { useState, useEffect } from 'react';

const ResidentManagementSection = ({ user, authToken }) => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState([]);

  // State for the photo modal
  const [selectedResident, setSelectedResident] = useState(null);

  // FIX 1: Initial state now includes the new household and PWD fields
  const [formData, setFormData] = useState({
    full_name: '',
    contact_email: '',
    contact_mobile: '',
    address: '',
    zone: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    household_id: '',
    relationship_to_head: 'Head',
    is_pwd: false
  });

  const handlePhotoUpload = async (residentId, file) => {
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('photo', file);

    try {
      const response = await fetch(`/api/residents/${residentId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: uploadData,
      });

      if (response.ok) {
        alert('Photo uploaded successfully!');
        fetchResidents();
      } else {
        alert('Failed to upload photo.');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('An error occurred during upload.');
    }
  };

  // FIX 2: Split useEffects so we don't accidentally re-fetch the entire table endlessly
  // 1. Fetch the whole table when search term changes
  useEffect(() => {
    fetchResidents();
  }, [searchTerm, authToken]);

  // 2. Fetch only the family tree when a specific profile is clicked
  useEffect(() => {
    if (selectedResident && selectedResident.household_id) {
      fetch(`/api/residents/${selectedResident.id}/household`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(res => res.json())
      .then(data => setHouseholdMembers(data))
      .catch(err => console.error("Failed to load family:", err));
    } else {
      setHouseholdMembers([]);
    }
  }, [selectedResident, authToken]);

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
      occupation: '',
      household_id: '',
      relationship_to_head: 'Head',
      is_pwd: false
    });
    setError('');
    setShowCreateModal(true);
  };

  const handleAdminPhoneChange = (e) => {
    let cleaned = e.target.value.replace(/\D/g, '');

    if (cleaned.length > 0) {
      if (cleaned[0] !== '0') {
        cleaned = '09' + cleaned;
      } else if (cleaned.length > 1 && cleaned[1] !== '9') {
        cleaned = '09' + cleaned.substring(1);
      }
    }

    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }

    let formatted = cleaned;
    if (cleaned.length > 7) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 7) + '-' + cleaned.slice(7, 11);
    } else if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }

    setFormData(prev => ({
      ...prev,
      contact_mobile: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.full_name || !formData.contact_mobile || !formData.address) {
      setError('Full name, contact mobile, and address are required.');
      setSubmitting(false);
      return;
    }

    try {
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
          occupation: '',
          household_id: '',
          relationship_to_head: 'Head',
          is_pwd: false
        });
        fetchResidents();
        alert('Resident created successfully!');
      } else {
        setError(data.message || data.error || 'Failed to create resident');
      }
    } catch (err) {
      setError(err.message || 'Failed to create resident. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resident? This action cannot be undone.')) {
      return;
    }

    try {
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
                  <button className="ghost-btn" onClick={() => setSelectedResident(resident)} style={{ color: '#3b82f6', marginRight: '0.5rem' }}>
                    📷 Photo
                  </button>
                  {user?.role === 'admin' && (
                    <button className="ghost-btn" onClick={() => handleDelete(resident.id)} style={{ color: '#ef4444' }}>
                      Delete
                    </button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- RESIDENT PHOTO MODAL --- */}
      {selectedResident && (
        <div className="modal-overlay" onClick={() => setSelectedResident(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>Resident Profile</h3>
              <button className="modal-close" onClick={() => setSelectedResident(null)}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 1rem' }}>
              <img
                src={selectedResident.photo_url ? `http://127.0.0.1:3001/uploads/${selectedResident.photo_url}` : 'https://via.placeholder.com/150?text=No+Photo'}
                alt="Resident Profile"
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />

              <div style={{ textAlign: 'center', width: '100%' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>{selectedResident.full_name}</h4>
                <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>{selectedResident.address}</p>

                <input
                  type="file"
                  id={`photo-upload-${selectedResident.id}`}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => {
                    if(e.target.files && e.target.files[0]) {
                      handlePhotoUpload(selectedResident.id, e.target.files[0]);
                      setSelectedResident(null);
                    }
                  }}
                />
                <button
                  className="primary-btn"
                  onClick={() => document.getElementById(`photo-upload-${selectedResident.id}`).click()}
                  style={{ width: '100%' }}
                >
                  📷 Upload New Photo
                </button>

                {/* FIX 3: THE FAMILY TREE SECTION IS NOW OUTSIDE THE BUTTON */}
                {selectedResident.household_id ? (
                  <div style={{ width: '100%', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                      Household Members (ID: {selectedResident.household_id})
                    </h4>
                    {householdMembers.length > 0 ? (
                      <div className="table" style={{ fontSize: '0.9rem' }}>
                        <div className="table-row head" style={{ padding: '0.75rem', gridTemplateColumns: '2fr 1fr 1fr' }}>
                          <span>Name</span>
                          <span>Relationship</span>
                          <span>Contact</span>
                        </div>
                        {householdMembers.map(member => (
                          <div key={member.id} className="table-row" style={{ padding: '0.75rem', gridTemplateColumns: '2fr 1fr 1fr' }}>
                            <span><strong>{member.full_name}</strong></span>
                            <span><span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>{member.relationship_to_head}</span></span>
                            <span>{member.contact_mobile || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="muted" style={{ textAlign: 'center', fontSize: '0.9rem' }}>No other registered members in this household.</p>
                    )}
                  </div>
                ) : (
                  <div style={{ width: '100%', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', textAlign: 'center' }}>
                    <p className="muted" style={{ fontSize: '0.9rem' }}>This resident is not assigned to a Household ID.</p>
                  </div>
                )}
                {/* END FAMILY TREE SECTION */}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE RESIDENT MODAL --- */}
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
                    onChange={handleAdminPhoneChange}
                    placeholder="09XX-XXX-XXXX"
                    pattern="^09\d{2}-\d{3}-\d{4}$"
                    title="Phone number must start with 09 and follow the format 09XX-XXX-XXXX"
                    required
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Household ID (e.g., HH-001)</label>
                  <input
                    type="text"
                    value={formData.household_id}
                    onChange={(e) => setFormData({ ...formData, household_id: e.target.value })}
                    placeholder="Leave blank if unknown"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
                <div className="form-group">
                  <label>Relationship to Head</label>
                  <select
                    value={formData.relationship_to_head}
                    onChange={(e) => setFormData({ ...formData, relationship_to_head: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    <option value="Head">Head of Family</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other Extended</option>
                  </select>
                </div>
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
              
              {/* FIX 4: Changed this to 3 columns to line up Gender, PWD, and Occupation! */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="is_pwd"
                    checked={formData.is_pwd}
                    onChange={(e) => setFormData({ ...formData, is_pwd: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label htmlFor="is_pwd" style={{ margin: 0, fontWeight: 'bold' }}>Register as PWD</label>
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