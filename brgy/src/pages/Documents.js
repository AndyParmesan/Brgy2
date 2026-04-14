import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { api } from '../api';
import './PublicPages.css';

const Documents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentType = searchParams.get('type');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(documentType || '');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authToken = localStorage.getItem('auth_token');

  // Formats a saved phone number (from DB) to 09XX-XXX-XXXX
  // Uses the same 4-3-4 grouping logic as handlePhoneChange
  const formatSavedPhone = (phoneStr) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');

    // Enforce "09" prefix on saved numbers too
    if (cleaned.length > 0 && cleaned[0] !== '0') {
      cleaned = '09' + cleaned;
    } else if (cleaned.length > 1 && cleaned[1] !== '9') {
      cleaned = '09' + cleaned.substring(2);
    }

    // 4-3-4 grouping: 09XX-XXX-XXXX
    if (cleaned.length > 7) {
      return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 7) + '-' + cleaned.slice(7, 11);
    } else if (cleaned.length > 4) {
      return cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    return cleaned;
  };

  const [formData, setFormData] = useState({
    document_type: documentType || '',
    purpose: '',
    contact_number: formatSavedPhone(user?.contact_number || user?.phone),
    address: user?.address || '',
    additional_info: ''
  });

  // Re-populate user fields every time the request form opens.
  // This handles cases where the user object loads after initial render.
  useEffect(() => {
    if (showRequestForm && user) {
      setFormData(prev => ({
        ...prev,
        contact_number: formatSavedPhone(user?.contact_number || user?.phone) || prev.contact_number,
        address: user?.address || prev.address,
      }));
    }
  }, [showRequestForm]);

  const requirements = {
    'clearance-requirements': {
      title: 'Barangay Clearance Requirements',
      content: `
        <ul class="requirements-list">
          <li>Valid ID (Government-issued)</li>
          <li>Barangay Residency Certificate or Proof of Address</li>
          <li>1x1 ID Picture (2 copies)</li>
          <li>Cedula or Community Tax Certificate</li>
          <li>Processing Fee: ₱50.00</li>
        </ul>
        <p><strong>Processing Time:</strong> 3-5 working days</p>
      `
    },
    'business-requirements': {
      title: 'Business Clearance Requirements',
      content: `
        <ul class="requirements-list">
          <li>DTI/SEC Registration</li>
          <li>Valid ID of Business Owner</li>
          <li>Proof of Business Location</li>
          <li>Barangay Clearance (Personal)</li>
          <li>Processing Fee: ₱200.00</li>
        </ul>
        <p><strong>Processing Time:</strong> 5-7 working days</p>
      `
    },
    'construction-requirements': {
      title: 'Construction Clearance Requirements',
      content: `
        <ul class="requirements-list">
          <li>Building Permit from City Hall</li>
          <li>Approved Building Plans</li>
          <li>Valid ID of Property Owner</li>
          <li>Land Title or Tax Declaration</li>
          <li>Processing Fee: ₱500.00</li>
        </ul>
        <p><strong>Processing Time:</strong> 7-10 working days</p>
      `
    },
    'residency-requirements': {
      title: 'Certificate of Residency Requirements',
      content: `
        <ul class="requirements-list">
          <li>Valid ID (Government-issued)</li>
          <li>Proof of Address (Utility Bill, Lease Contract)</li>
          <li>1x1 ID Picture (1 copy)</li>
          <li>Processing Fee: ₱30.00</li>
        </ul>
        <p><strong>Processing Time:</strong> 2-3 working days</p>
      `
    },
    'indigency-requirements': {
      title: 'Certificate of Indigency Requirements',
      content: `
        <ul class="requirements-list">
          <li>Valid ID</li>
          <li>Proof of Income (if employed)</li>
          <li>Medical Certificate (if for medical assistance)</li>
          <li>Barangay Clearance</li>
          <li>Processing Fee: Free</li>
        </ul>
        <p><strong>Processing Time:</strong> 3-5 working days</p>
      `
    },
    'moral-requirements': {
      title: 'Good Moral Certificate Requirements',
      content: `
        <ul class="requirements-list">
          <li>Valid ID</li>
          <li>Barangay Clearance</li>
          <li>1x1 ID Picture (1 copy)</li>
          <li>Letter of Request stating purpose</li>
          <li>Processing Fee: ₱50.00</li>
        </ul>
        <p><strong>Processing Time:</strong> 3-5 working days</p>
      `
    }
  };

  const openModal = (type) => {
    if (requirements[type]) {
      setModalContent(requirements[type]);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  useEffect(() => {
    if (documentType && user) {
      setShowRequestForm(true);
      setSelectedDocumentType(documentType);
      setFormData(prev => ({ ...prev, document_type: documentType }));
    }
  }, [documentType, user]);

  const handleRequestDocument = (docType) => {
    if (!user || !authToken) {
      navigate('/login');
      return;
    }
    setSelectedDocumentType(docType);
    setFormData(prev => ({ ...prev, document_type: docType }));
    setShowRequestForm(true);
  };

  // FIX: Uses else-if and slices only from `cleaned` (not `formatted`)
  // to produce the correct 09XX-XXX-XXXX grouping at every length.
  const handlePhoneChange = (e) => {
    let cleaned = e.target.value.replace(/\D/g, '');

    // Enforce "09" prefix as the user types
    if (cleaned.length > 0 && cleaned[0] !== '0') {
      cleaned = '09' + cleaned;
    } else if (cleaned.length > 1 && cleaned[1] !== '9') {
      cleaned = '09' + cleaned.substring(2);
    }

    // Limit to 11 digits (09XX-XXX-XXXX = 11 raw digits)
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }

    // 4-3-4 grouping using else-if so only one branch runs
    let formatted = cleaned;
    if (cleaned.length > 7) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 7) + '-' + cleaned.slice(7, 11);
    } else if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }

    setFormData(prev => ({
      ...prev,
      contact_number: formatted
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/public/document-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          requester_name: user.name,
          document_type: formData.document_type,
          purpose: formData.purpose,
          contact_number: formData.contact_number,
          email: user.email,
          address: formData.address,
          additional_info: formData.additional_info
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          document_type: '',
          purpose: '',
          contact_number: '',
          address: '',
          additional_info: ''
        });
        setTimeout(() => {
          setShowRequestForm(false);
          navigate('/resident-dashboard');
        }, 2000);
      } else {
        setSubmitError(data.error || 'Failed to submit document request');
      }
    } catch (err) {
      setSubmitError('Failed to submit document request. Please try again.');
      console.error('Error submitting request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Document Services</h1>
          <p>Request and manage your barangay documents online</p>
        </div>
      </section>

      {/* Available Documents Section */}
      <section className="documents-section">
        <div className="container">
          <div className="section-header">
            <h2>Available Documents</h2>
            <Link to="/login" className="btn primary">Request a Document</Link>
          </div>

          {/* Barangay Clearances */}
          <div className="document-category">
            <h3>Barangay Clearances</h3>
            <div className="document-grid">
              <div className="document-card">
                <div className="document-icon">📄</div>
                <h4>Barangay Clearance</h4>
                <p>Required for employment, business permits, and other legal purposes</p>
                <div className="document-actions">
                  <button className="btn primary" onClick={() => openModal('clearance-requirements')}>View Requirements</button>
                  {user ? (
                    <button className="btn secondary" onClick={() => handleRequestDocument('Barangay Clearance')}>Apply Now</button>
                  ) : (
                    <Link to="/login" className="btn secondary">Apply Now</Link>
                  )}
                </div>
              </div>
              <div className="document-card">
                <div className="document-icon">🏪</div>
                <h4>Business Clearance</h4>
                <p>Needed for business registration and renewal</p>
                <div className="document-actions">
                  <button className="btn primary" onClick={() => openModal('business-requirements')}>View Requirements</button>
                  {user ? (
                    <button className="btn secondary" onClick={() => handleRequestDocument('Business Clearance')}>Apply Now</button>
                  ) : (
                    <Link to="/login" className="btn secondary">Apply Now</Link>
                  )}
                </div>
              </div>
              <div className="document-card">
                <div className="document-icon">🏗️</div>
                <h4>Construction Clearance</h4>
                <p>Required before starting any construction project</p>
                <div className="document-actions">
                  <button className="btn primary" onClick={() => openModal('construction-requirements')}>View Requirements</button>
                  {user ? (
                    <button className="btn secondary" onClick={() => handleRequestDocument('Construction Clearance')}>Apply Now</button>
                  ) : (
                    <Link to="/login" className="btn secondary">Apply Now</Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Certificates and Endorsements */}
          <div className="document-category">
            <h3>Certificates and Endorsements</h3>
            <div className="document-grid">
              <div className="document-card">
                <div className="document-icon">🏠</div>
                <h4>Certificate of Residency</h4>
                <p>Proof of residence within the barangay</p>
                <div className="document-actions">
                  <button className="btn primary" onClick={() => openModal('residency-requirements')}>Learn More</button>
                  {user ? (
                    <button className="btn secondary" onClick={() => handleRequestDocument('Certificate of Residency')}>Request Certificate</button>
                  ) : (
                    <Link to="/login" className="btn secondary">Request Certificate</Link>
                  )}
                </div>
              </div>
              <div className="document-card">
                <div className="document-icon">💰</div>
                <h4>Certificate of Indigency</h4>
                <p>For financial assistance and medical purposes</p>
                <div className="document-actions">
                  <button className="btn primary" onClick={() => openModal('indigency-requirements')}>Learn More</button>
                  {user ? (
                    <button className="btn secondary" onClick={() => handleRequestDocument('Certificate of Indigency')}>Request Certificate</button>
                  ) : (
                    <Link to="/login" className="btn secondary">Request Certificate</Link>
                  )}
                </div>
              </div>
              <div className="document-card">
                <div className="document-icon">👥</div>
                <h4>Good Moral Certificate</h4>
                <p>Character reference for employment or school</p>
                <div className="document-actions">
                  <button className="btn primary" onClick={() => openModal('moral-requirements')}>Learn More</button>
                  {user ? (
                    <button className="btn secondary" onClick={() => handleRequestDocument('Good Moral Certificate')}>Request Certificate</button>
                  ) : (
                    <Link to="/login" className="btn secondary">Request Certificate</Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Frequently Requested Documents */}
          <div className="document-category">
            <h3>Frequently Requested Documents</h3>
            <div className="document-grid">
              <div className="document-card">
                <div className="document-icon">🆔</div>
                <h4>Barangay ID</h4>
                <p>Official identification for residents</p>
                {user ? (
                  <button className="btn primary" onClick={() => handleRequestDocument('Barangay ID')}>Request Now</button>
                ) : (
                  <Link to="/login" className="btn primary">Request Now</Link>
                )}
              </div>
              <div className="document-card">
                <div className="document-icon">📋</div>
                <h4>Community Tax Certificate (Cedula)</h4>
                <p>Annual tax certificate for residents</p>
                {user ? (
                  <button className="btn primary" onClick={() => handleRequestDocument('Community Tax Certificate (Cedula)')}>Request Now</button>
                ) : (
                  <Link to="/login" className="btn primary">Request Now</Link>
                )}
              </div>
              <div className="document-card">
                <div className="document-icon">📑</div>
                <h4>First-Time Jobseeker Certificate</h4>
                <p>For first-time employment seekers</p>
                {user ? (
                  <button className="btn primary" onClick={() => handleRequestDocument('First-Time Jobseeker Certificate')}>Request Now</button>
                ) : (
                  <Link to="/login" className="btn primary">Request Now</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Modal */}
      {showModal && modalContent && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h3>{modalContent.title}</h3>
            <div className="modal-body" dangerouslySetInnerHTML={{ __html: modalContent.content }}></div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={closeModal}>Close</button>
              {user ? (
                <button className="btn primary" onClick={() => { closeModal(); setShowRequestForm(true); }}>Apply Now</button>
              ) : (
                <Link to="/login" className="btn primary">Apply Now</Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Request Form Modal */}
      {showRequestForm && user && (
        <div className="modal-backdrop" onClick={() => setShowRequestForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <button className="modal-close" onClick={() => setShowRequestForm(false)}>&times;</button>
            <h3>Request Document</h3>
            {submitSuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h4>Request Submitted Successfully!</h4>
                <p>Your document request has been submitted. You will be redirected to your dashboard shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="modal-body">
                {submitError && (
                  <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    {submitError}
                  </div>
                )}

                {/* Auto-filled read-only fields shown to logged-in users */}
                {user && (
                  <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#166534' }}>
                    ✅ Your profile info has been auto-filled below. You may update it if needed.
                  </div>
                )}

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={user?.full_name || user?.name || ''}
                    readOnly
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>Document Type *</label>
                  <input
                    type="text"
                    value={formData.document_type}
                    readOnly
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>Purpose *</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="State the purpose for requesting this document"
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={handlePhoneChange}
                    placeholder="09XX-XXX-XXXX"
                    pattern="^09\d{2}-\d{3}-\d{4}$"
                    title="Phone number must start with 09 and follow the format 09XX-XXX-XXXX"
                    maxLength={13}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Complete Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Lot/Block, Street, Zone, Barangay"
                    required
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Additional Information</label>
                  <textarea
                    value={formData.additional_info}
                    onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                    placeholder="Any additional information or notes"
                    rows="3"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn secondary" onClick={() => setShowRequestForm(false)}>Cancel</button>
                  <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Documents;
