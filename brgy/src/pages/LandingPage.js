import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getApiStatus } from '../utils/apiStatus';
import './PublicPages.css';

const LandingPage = ({ user, onLogout }) => {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getApiStatus();
      setApiStatus(status);
    };
    checkStatus();
  }, []);

  return (
    <div className="public-page">
      <Navigation user={user} onLogout={onLogout} />
      
      {apiStatus && !apiStatus.connected && (
        <div style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          borderBottom: '2px solid #ffc107'
        }}>
          ⚠️ {apiStatus.message}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Barangay 853</h1>
            <p className="hero-subtitle">This platform serves as the official online system for managing barangay-related services, announcements, and requests. It is designed to streamline communication, improve accessibility, and ensure efficient public service for all residents.</p>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">Hero Image</div>
          </div>
        </div>
      </section>

      {/* Online Document Request Section */}
      <section className="document-request-section">
        <div className="container">
          <div className="section-header">
            <h2>Online Document Request</h2>
            <p>Request barangay documents from the comfort of your home</p>
          </div>
          <div className="request-cards">
            <div className="request-card">
              <div className="card-icon">📄</div>
              <h3>Barangay Clearance</h3>
              <p>Required for various legal and employment purposes</p>
              <Link to="/documents" className="btn primary">Submit a Request</Link>
            </div>
            <div className="request-card">
              <div className="card-icon">🆔</div>
              <h3>Barangay ID</h3>
              <p>Official identification for barangay residents</p>
              <Link to="/documents" className="btn primary">Submit a Request</Link>
            </div>
            <div className="request-card">
              <div className="card-icon">📋</div>
              <h3>Certificates</h3>
              <p>Various certificates for different purposes</p>
              <Link to="/documents" className="btn primary">View Requirements</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="explore-section">
        <div className="container">
          <h2 className="section-title">Explore</h2>
          <div className="explore-cards">
            <Link to="/announcements" className="explore-card">
              <div className="explore-icon">📢</div>
              <h3>Services Offered</h3>
              <p>Browse all available barangay services</p>
            </Link>
            <Link to="/announcements" className="explore-card">
              <div className="explore-icon">📰</div>
              <h3>Announcements</h3>
              <p>Stay updated with the latest news and events</p>
            </Link>
            <Link to="/documents" className="explore-card">
              <div className="explore-icon">📝</div>
              <h3>Resident Requests</h3>
              <p>Submit and track your document requests</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

