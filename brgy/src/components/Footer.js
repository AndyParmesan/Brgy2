import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Barangay 853</h4>
            <p>Serving the community with dedication and transparency</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/documents">Documents</Link></li>
              <li><Link to="/announcements">Announcements</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: barangay853@example.com</p>
            <p>Phone: (02) 1234-5678</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Barangay 853. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

