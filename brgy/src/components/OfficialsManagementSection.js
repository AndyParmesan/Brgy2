import React, { useState, useEffect } from 'react';

const OfficialsManagementSection = ({ authToken }) => {
  const [officials, setOfficials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    position: '', 
    category: 'Kagawad', 
    image_url: '' 
  });

  const fetchOfficials = async () => {
    try {
      const res = await fetch('/api/officials');
      const data = await res.json();
      setOfficials(data);
    } catch (err) {
      console.error('Failed to fetch officials:', err);
    }
  };

  useEffect(() => { fetchOfficials(); }, []);

  // Convert uploaded image to Base64 so the database can store it easily
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/officials/${editingId}` : '/api/officials';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${authToken}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', position: '', category: 'Kagawad', image_url: '' });
        fetchOfficials();
      } else {
        alert('Failed to save official.');
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (official) => {
    setEditingId(official.id);
    setFormData({
      name: official.name,
      position: official.position,
      category: official.category,
      image_url: official.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to remove this official?')) { 
      await fetch(`/api/officials/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${authToken}` } 
      }); 
      fetchOfficials(); 
    }
  };

  return (
    <section className="panel">
      <header className="panel-heading">
        <div>
          <h2>Manage Officials</h2>
          <p className="muted">Add, edit, or remove barangay officials and their photos.</p>
        </div>
        <button className="primary-btn compact" onClick={() => {
          setEditingId(null);
          setFormData({ name: '', position: '', category: 'Kagawad', image_url: '' });
          setShowModal(true);
        }}>
          + Add Official
        </button>
      </header>

      <div className="table" style={{ marginTop: '1.5rem' }}>
        <div className="table-row head">
          <span>Photo</span>
          <span>Name</span>
          <span>Position</span>
          <span>Category</span>
          <span>Actions</span>
        </div>
        {officials.length === 0 ? (
          <div className="table-row"><span colSpan="5" style={{ textAlign: 'center' }}>No officials found. Add one!</span></div>
        ) : (
          officials.map(off => (
            <div key={off.id} className="table-row" style={{ alignItems: 'center' }}>
              <span>
                {off.image_url ? (
                  <img src={off.image_url} alt="Official" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="avatar-initial" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>{off.name.charAt(0)}</div>
                )}
              </span>
              <span><strong>{off.name}</strong></span>
              <span>{off.position}</span>
              <span><span className="status-badge status-approved">{off.category}</span></span>
              <span>
                <button className="ghost-btn" onClick={() => openEditModal(off)} style={{ marginRight: '10px' }}>Edit</button>
                <button className="ghost-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(off.id)}>Delete</button>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Official' : 'Add New Official'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              
              {/* Image Preview & Upload */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px dashed #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '2rem' }}>📷</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.8rem' }} />
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
              </div>

              <div className="form-group">
                <label>Position * (e.g., Barangay Chairman)</label>
                <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required className="input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                  <option value="Executive">Executive (Top 3)</option>
                  <option value="Kagawad">Kagawad</option>
                  <option value="SK">SK</option>
                </select>
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="ghost-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Official'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default OfficialsManagementSection;