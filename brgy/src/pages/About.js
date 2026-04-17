import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { api } from '../api';
import './PublicPages.css';

const About = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await api.submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message
      });

      setShowSuccessModal(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setSubmitError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="public-page">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>About Barangay 853</h1>
          <p>Get to know our community and officials</p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-section">
        <div className="container">
         {/* History Section */}
          <div className="about-content">
            <div className="content-text" style={{ width: '100%' }}>
              <h2>Our History</h2>
              <p>Barangay 853 has been serving its community with dedication and commitment for decades. Established as part of Metro Manila's barangay system, we have grown from a small neighborhood into a vibrant community of diverse families and businesses.</p>
              <p>Throughout the years, we have maintained our commitment to providing excellent public service, fostering community development, and ensuring the safety and well-being of all our residents.</p>
            </div>
            {/* The filler historical image box has been removed! */}
          </div>

          {/* Mission & Vision */}
          <div className="mission-vision">
            <div className="mv-card">
              <h3>Our Mission</h3>
              <p>To provide efficient, responsive, and transparent governance that promotes the welfare and development of all residents through quality public service and community engagement.</p>
            </div>
            <div className="mv-card">
              <h3>Our Vision</h3>
              <p>A progressive, peaceful, and united barangay where every resident enjoys a high quality of life, sustainable development, and active participation in community affairs.</p>
            </div>
          </div>

          {/* Barangay Officials */}
          <div className="officials-section">
            <h2>Barangay Officials</h2>
            <p className="section-subtitle">Meet our dedicated leaders serving the community</p>
            
            <div className="officials-grid">
              <div className="official-card">
                <div className="official-photo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div className="avatar-initial" style={{ width: '120px', height: '120px', fontSize: '3rem' }}>R</div>
                </div>
                <h4>Hon. Roger Ferrer</h4>
                <p className="position">Barangay Chairman</p>
              </div>

              <div className="official-card">
                <div className="official-photo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div className="avatar-initial" style={{ width: '120px', height: '120px', fontSize: '3rem' }}>W</div>
                </div>
                <h4>Wilfredo Delos Santos</h4>
                <p className="position">Barangay Secretary</p>
              </div>

              <div className="official-card">
                <div className="official-photo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div className="avatar-initial" style={{ width: '120px', height: '120px', fontSize: '3rem' }}>A</div>
                </div>
                <h4>Adey Gregorio</h4>
                <p className="position">Barangay Treasurer</p>
              </div>
            </div>

            <h3>Barangay Council & SK</h3>
            <div className="kagawads-grid">
              {[
                { name: 'Hon. Gemma Blaquera', position: 'Kagawad - Health & Sanitation', initial: 'G' },
                { name: 'Hon. Merlita Galon', position: 'Kagawad - Services', initial: 'M' },
                { name: 'Hon. Mica Grace Villaluz', position: 'SK Chairman', initial: 'M' }
              ].map((official, idx) => (
                <div key={idx} className="kagawad-card">
                  <div className="kagawad-photo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                     <div className="avatar-initial" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                       {official.initial}
                     </div>
                  </div>
                  <h5>{official.name}</h5>
                  <p>{official.position}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h2>Contact Us</h2>
            <p className="section-subtitle">Have questions or concerns? Send us a message</p>

            <div className="contact-container">
              <div className="contact-info">
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div>
                    <h4>Address</h4>
                    <p>Barangay 853, Zone 94<br />District VI, Manila</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div>
                    <h4>Phone</h4>
                    <p>(02) 1234-5678<br />Mobile: 0917-123-4567</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📧</div>
                  <div>
                    <h4>Email</h4>
                    <p>barangay853@manila.gov.ph<br />info@barangay853.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">🕒</div>
                  <div>
                    <h4>Office Hours</h4>
                    <p>Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 8:00 AM - 12:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="contact-form-container">
                <form id="contact-form" className="contact-form" onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="login-error" style={{ marginBottom: '1rem' }}>
                      {submitError}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      className="input" 
                      required
                      value={formData.name}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address <span className="required">*</span></label>
                    <input 
                      type="email" 
                      name="email"
                      className="input" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="input" 
                      placeholder="09XX-XXX-XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="subject"
                      className="input" 
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Message <span className="required">*</span></label>
                    <textarea 
                      name="message"
                      className="input" 
                      rows="5" 
                      required
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-backdrop" onClick={() => setShowSuccessModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-success-icon">✓</div>
            <h3>Message Sent Successfully</h3>
            <p>Thank you for contacting us. We will get back to you as soon as possible.</p>
            <div className="modal-footer">
              <button className="btn primary" onClick={() => setShowSuccessModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default About;

