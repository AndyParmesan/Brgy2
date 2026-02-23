import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ResidentDashboard.css';
import logoBrgy from '../assets/logo-brgy.png';

const API_BASE_URL = 'http://127.0.0.1:3001/api';

const ResidentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [blotterCases, setBlotterCases] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('auth_token');

    try {
      if (activeTab === 'documents') {
        const response = await fetch(`${API_BASE_URL}/my-document-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          setError('Failed to load documents. Please try again.');
        }
      } else if (activeTab === 'blotter') {
        const response = await fetch(`${API_BASE_URL}/my-blotter-cases`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBlotterCases(data);
        } else {
          setError('Failed to load cases. Please try again.');
        }
      } else if (activeTab === 'announcements') {
        const response = await fetch(`${API_BASE_URL}/public/announcements`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(Array.isArray(data) ? data : []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || 'Failed to load announcements. Please try again.');
          console.error('❌ Failed to load announcements:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
        }
      }
    } catch (err) {
      setError('Failed to load data. Please check your connection and try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when component becomes visible (user returns from documents page)
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'documents') {
        fetchData();
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab === 'documents') {
        fetchData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, fetchData]);

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'approved' || statusLower === 'completed' || statusLower === 'resolved') {
      return 'status-approved';
    } else if (statusLower === 'pending' || statusLower === 'in review' || statusLower === 'processing') {
      return 'status-pending';
    } else if (statusLower === 'rejected' || statusLower === 'cancelled' || statusLower === 'closed') {
      return 'status-rejected';
    }
    return 'status-default';
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

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/');
  };

  const LoadingSkeleton = () => (
    <div className="loading-skeleton">
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
    </div>
  );

  return (
    <div className="resident-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="header-brand">
              <img src={logoBrgy} alt="Brgy. 853 Zone 93" className="header-logo" />
              <div className="brand-text">
                <h1>Brgy. 853 Zone 93</h1>
                <p className="motto">Tulong-Tulong Sama-Sama</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user?.name || 'Resident'} 
                  className="user-avatar-img"
                />
              ) : (
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'R'}
                </div>
              )}
              <div className="user-details">
                <p className="user-name">{user?.name || 'Resident'}</p>
                <p className="user-role">Resident Account</p>
              </div>
            </div>
            <div className="header-buttons">
              <Link to="/" className="btn-home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </Link>
              <button className="btn-logout" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`dashboard-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-container">
          <button
            className={`nav-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('documents');
              setMobileMenuOpen(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>My Documents</span>
            {documents.length > 0 && (
              <span className="tab-badge">{documents.length}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === 'blotter' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('blotter');
              setMobileMenuOpen(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>My Cases</span>
            {blotterCases.length > 0 && (
              <span className="tab-badge">{blotterCases.length}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('announcements');
              setMobileMenuOpen(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Announcements</span>
            {announcements.length > 0 && (
              <span className="tab-badge">{announcements.length}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-container">
          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="content-section">
                  <div className="section-header">
                    <div>
                      <h2>My Document Requests</h2>
                      <p className="section-subtitle">Track the status of your document applications</p>
                    </div>
                    <Link to="/documents" className="btn-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Request New Document
                    </Link>
                  </div>

                  {documents.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <h3>No Document Requests</h3>
                      <p>You haven't requested any documents yet. Start by requesting a document.</p>
                      <Link to="/documents" className="btn-primary">
                        Request a Document
                      </Link>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="documents-table">
                        <thead>
                          <tr>
                            <th>Reference No.</th>
                            <th>Document Type</th>
                            <th>Purpose</th>
                            <th>Date Filed</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc) => (
                            <tr key={doc.id}>
                              <td className="ref-cell">
                                <span className="ref-number">{doc.reference_no || `DOC-${doc.id}`}</span>
                              </td>
                              <td className="doc-type-cell">
                                <strong>{doc.document_type || 'Document Request'}</strong>
                              </td>
                              <td className="purpose-cell">
                                <span className="purpose-text" title={doc.purpose || 'N/A'}>
                                  {doc.purpose ? (doc.purpose.length > 50 ? `${doc.purpose.substring(0, 50)}...` : doc.purpose) : 'N/A'}
                                </span>
                              </td>
                              <td className="date-cell">
                                <span className="date-value">{formatDate(doc.date_filed || doc.created_at)}</span>
                              </td>
                              <td className="status-cell">
                                <span className={`status-badge ${getStatusBadgeClass(doc.status)}`}>
                                  {doc.status || 'Pending'}
                                </span>
                              </td>
                              <td className="actions-cell">
                                <button 
                                  className="btn-view"
                                  onClick={() => {
                                    // View details - could open a modal or navigate
                                    alert(`Document Details:\n\nReference: ${doc.reference_no || `DOC-${doc.id}`}\nType: ${doc.document_type}\nPurpose: ${doc.purpose || 'N/A'}\nStatus: ${doc.status || 'Pending'}\nDate Filed: ${formatDate(doc.date_filed || doc.created_at)}`);
                                  }}
                                  title="View Details"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Blotter Cases Tab */}
              {activeTab === 'blotter' && (
                <div className="content-section">
                  <div className="section-header">
                    <div>
                      <h2>My Blotter Cases</h2>
                      <p className="section-subtitle">View the status of your reported cases</p>
                    </div>
                    {blotterCases.length > 0 && (
                      <Link to="/report" className="btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        File New Report
                      </Link>
                    )}
                  </div>

                  {blotterCases.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <h3>No Blotter Cases</h3>
                      <p>You haven't filed any blotter cases yet. File a report to get started.</p>
                      <Link to="/report" className="btn-primary">
                        File a Report
                      </Link>
                    </div>
                  ) : (
                    <div className="cards-grid">
                      {blotterCases.map((case_) => (
                        <div key={case_.id} className="card">
                          <div className="card-header">
                            <div className="card-title-group">
                              <h3 className="card-title">{case_.case_title || case_.category || 'Blotter Case'}</h3>
                              <span className={`status-badge ${getStatusBadgeClass(case_.status)}`}>
                                {case_.status || 'Pending'}
                              </span>
                            </div>
                            <p className="card-reference">Case: {case_.case_no || `BR-${case_.id}`}</p>
                          </div>
                          <div className="card-body">
                            <div className="card-info">
                              <div className="info-item">
                                <span className="info-label">Date Reported</span>
                                <span className="info-value">{formatDate(case_.date_reported)}</span>
                              </div>
                              {case_.location && (
                                <div className="info-item">
                                  <span className="info-label">Location</span>
                                  <span className="info-value">{case_.location}</span>
                                </div>
                              )}
                              {case_.summary && (
                                <div className="info-item full-width">
                                  <span className="info-label">Summary</span>
                                  <span className="info-value">{case_.summary}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Announcements Tab */}
              {activeTab === 'announcements' && (
                <div className="content-section">
                  <div className="section-header">
                    <div>
                      <h2>Announcements</h2>
                      <p className="section-subtitle">Stay updated with the latest barangay news and updates</p>
                    </div>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <h3>No Announcements</h3>
                      <p>There are no announcements available at the moment. Check back later for updates.</p>
                    </div>
                  ) : (
                    <div className="announcements-grid">
                      {announcements.map((announcement) => (
                        <article key={announcement.id} className="announcement-card">
                          <div className="announcement-header">
                            <span className="announcement-badge">{announcement.badge || 'Announcement'}</span>
                            <span className="announcement-date">{announcement.date || 'Available Daily'}</span>
                          </div>
                          <h3 className="announcement-title">{announcement.title}</h3>
                          <p className="announcement-summary">
                            {announcement.summary || announcement.description || 'No description available.'}
                          </p>
                          {announcement.link && (
                            <a 
                              href={announcement.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="announcement-link"
                            >
                              Learn More
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                              </svg>
                            </a>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResidentDashboard;
