import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { api } from '../api';
import './PublicPages.css';

const Report = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterContact: '',
    reporterEmail: '',
    reporterAddress: '',
    incidentType: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    personsInvolved: '',
    incidentDescription: '',
    witnesses: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await api.submitReport({
        reporter_name: formData.reporterName,
        reporter_contact: formData.reporterContact,
        reporter_email: formData.reporterEmail || null,
        reporter_address: formData.reporterAddress,
        incident_type: formData.incidentType,
        incident_date: formData.incidentDate,
        incident_time: formData.incidentTime,
        incident_location: formData.incidentLocation,
        incident_description: formData.incidentDescription,
        persons_involved: formData.personsInvolved || null,
        witnesses: formData.witnesses || null,
      });

      setReferenceNumber(response.reference_no);
      setShowConfirmation(true);
      setFormData({
        reporterName: '',
        reporterContact: '',
        reporterEmail: '',
        reporterAddress: '',
        incidentType: '',
        incidentDate: '',
        incidentTime: '',
        incidentLocation: '',
        personsInvolved: '',
        incidentDescription: '',
        witnesses: '',
        agreeTerms: false
      });
    } catch (err) {
      console.error('Error submitting report:', err);
      setSubmitError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="public-page">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>File an Incident Report</h1>
          <p>Report incidents and concerns to the barangay officials</p>
        </div>
      </section>

      {/* Report Form Section */}
      <section className="report-section">
        <div className="container">
          <div className="report-container">
            <div className="report-info">
              <h2>Barangay Blotter System</h2>
              <p>The barangay blotter is an official record of all incidents reported within our jurisdiction. Filing a report helps maintain peace and order in our community.</p>
              
              <div className="info-box">
                <h3>What can be reported?</h3>
                <ul>
                  <li>Noise complaints</li>
                  <li>Disputes between neighbors</li>
                  <li>Theft or robbery</li>
                  <li>Physical altercations</li>
                  <li>Property damage</li>
                  <li>Suspicious activities</li>
                  <li>Other community concerns</li>
                </ul>
              </div>

              <div className="info-box">
                <h3>Important Notes</h3>
                <ul>
                  <li>All information provided will be kept confidential</li>
                  <li>False reporting is punishable by law</li>
                  <li>For emergencies, please call 911 immediately</li>
                  <li>You may be contacted for follow-up questions</li>
                </ul>
              </div>

              <div className="emergency-contact">
                <h3>Emergency Contacts</h3>
                <p><strong>Barangay Hotline:</strong> (02) 1234-5678</p>
                <p><strong>Police Emergency:</strong> 911</p>
                <p><strong>Fire Department:</strong> (02) 8888-0000</p>
              </div>
            </div>

            <div className="report-form-container">
              <form id="report-form" className="report-form" onSubmit={handleSubmit}>
                <h3>Incident Report Form</h3>
                <p className="form-subtitle">Please provide accurate and detailed information</p>
                
                {submitError && (
                  <div className="login-error" style={{ marginBottom: '1rem' }}>
                    {submitError}
                  </div>
                )}

                <div className="form-section">
                  <h4>Reporter Information</h4>
                  
                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="reporterName"
                      className="input" 
                      required
                      value={formData.reporterName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Number <span className="required">*</span></label>
                      <input 
                        type="tel" 
                        name="reporterContact"
                        className="input" 
                        placeholder="09XX-XXX-XXXX" 
                        required
                        value={formData.reporterContact}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        name="reporterEmail"
                        className="input"
                        value={formData.reporterEmail}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="reporterAddress"
                      className="input" 
                      required
                      value={formData.reporterAddress}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Incident Details</h4>

                  <div className="form-group">
                    <label>Type of Incident <span className="required">*</span></label>
                    <select 
                      name="incidentType"
                      className="input" 
                      required
                      value={formData.incidentType}
                      onChange={handleChange}
                    >
                      <option value="">Select incident type...</option>
                      <option value="noise">Noise Complaint</option>
                      <option value="dispute">Neighbor Dispute</option>
                      <option value="theft">Theft/Robbery</option>
                      <option value="assault">Physical Altercation/Assault</option>
                      <option value="property">Property Damage</option>
                      <option value="suspicious">Suspicious Activity</option>
                      <option value="harassment">Harassment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Incident <span className="required">*</span></label>
                      <input 
                        type="date" 
                        name="incidentDate"
                        className="input" 
                        required
                        max={today}
                        value={formData.incidentDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Time of Incident <span className="required">*</span></label>
                      <input 
                        type="time" 
                        name="incidentTime"
                        className="input" 
                        required
                        value={formData.incidentTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Location of Incident <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="incidentLocation"
                      className="input" 
                      placeholder="Street, House Number, etc." 
                      required
                      value={formData.incidentLocation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Persons Involved</label>
                    <textarea 
                      name="personsInvolved"
                      className="input" 
                      rows="3" 
                      placeholder="Name(s) of person(s) involved in the incident"
                      value={formData.personsInvolved}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Detailed Description of Incident <span className="required">*</span></label>
                    <textarea 
                      name="incidentDescription"
                      className="input" 
                      rows="6" 
                      placeholder="Please provide a detailed account of what happened..." 
                      required
                      value={formData.incidentDescription}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Witnesses (if any)</label>
                    <textarea 
                      name="witnesses"
                      className="input" 
                      rows="2" 
                      placeholder="Name(s) and contact information of witnesses"
                      value={formData.witnesses}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="agreeTerms"
                        required
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                      <span>I hereby certify that all information provided is true and correct to the best of my knowledge. I understand that providing false information is punishable by law.</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="reset" className="btn secondary" disabled={submitting}>Clear Form</button>
                  <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-backdrop" onClick={() => setShowConfirmation(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-success-icon">✓</div>
            <h3>Report Submitted Successfully</h3>
            <p>Your incident report has been received. A barangay official will review your report and contact you if additional information is needed.</p>
            <p><strong>Reference Number:</strong> <span>{referenceNumber}</span></p>
            <div className="modal-footer">
              <button className="btn primary" onClick={() => setShowConfirmation(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Report;

