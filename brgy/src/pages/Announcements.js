import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { api } from '../api';
import './PublicPages.css';

const Announcements = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await api.getPublicAnnouncements();
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
        // Fallback to static data if API fails
        setAnnouncements([
          {
            id: 1,
            category: 'services',
            badge: 'Service',
            title: 'Document Processing Services',
            date: 'Available Daily',
            description: 'Get your barangay documents processed quickly and efficiently. We offer various certifications, clearances, and IDs.',
            items: ['Barangay Clearance', 'Certificate of Residency', 'Certificate of Indigency', 'Barangay ID'],
            link: '/documents'
          },
    {
      id: 2,
      category: 'services',
      badge: 'Service',
      title: 'Health & Wellness Programs',
      date: 'Every Tuesday & Thursday',
      description: 'Free health check-ups, immunization programs, and wellness consultations for all residents.',
      items: ['Blood pressure monitoring', 'Child immunization', 'Prenatal check-ups', 'Health consultations'],
      info: 'Time: 9:00 AM - 3:00 PM\nLocation: Barangay Health Center'
    },
    {
      id: 3,
      category: 'services',
      badge: 'Service',
      title: 'Free Legal Assistance',
      date: 'Every Monday & Wednesday',
      description: 'Consult with our legal advisors for free legal advice and assistance in resolving disputes.',
      items: ['Legal consultations', 'Mediation services', 'Document preparation', 'Referral services'],
      info: 'Time: 10:00 AM - 4:00 PM\nLocation: Barangay Hall, 2nd Floor'
    },
    {
      id: 4,
      category: 'announcements',
      badge: 'Announcement',
      title: 'Barangay Assembly Meeting',
      date: 'Posted: November 25, 2025',
      description: 'All residents are invited to attend the quarterly barangay assembly. Discuss community concerns, development plans, and upcoming projects.',
      info: 'Date: December 15, 2025\nTime: 2:00 PM - 5:00 PM\nVenue: Barangay Covered Court',
      note: 'Note: Light snacks will be served. Please bring valid ID.'
    },
    {
      id: 5,
      category: 'announcements',
      badge: 'Announcement',
      title: 'Updated Garbage Collection Schedule',
      date: 'Posted: November 20, 2025',
      description: 'Please take note of the new garbage collection schedule effective December 1, 2025.',
      schedule: [
        { label: 'Biodegradable:', value: 'Monday, Wednesday, Friday' },
        { label: 'Non-biodegradable:', value: 'Tuesday, Thursday, Saturday' },
        { label: 'Collection Time:', value: '6:00 AM - 10:00 AM' }
      ],
      note: 'Reminder: Segregate your waste properly. Penalties apply for violations.'
    },
    {
      id: 6,
      category: 'events',
      badge: 'Event',
      title: 'Barangay Christmas Celebration',
      date: 'Event Date: December 20, 2025',
      description: 'Join us for a night of fun, games, and fellowship as we celebrate the Christmas season together!',
      highlights: [
        'Christmas Caroling Competition',
        'Gift-giving for children and senior citizens',
        'Raffle draws with exciting prizes',
        'Free food and refreshments',
        'Live entertainment'
      ],
      info: 'Time: 5:00 PM onwards\nVenue: Barangay Plaza'
    },
    {
      id: 7,
      category: 'events',
      badge: 'Event',
      title: 'Barangay Sports Festival',
      date: 'Event Date: January 15-20, 2026',
      description: 'Show your barangay pride! Register now for our annual sports festival featuring basketball, volleyball, and more.',
      highlights: [
        'Basketball (Men\'s & Women\'s)',
        'Volleyball (Mixed)',
        'Chess Tournament',
        'Table Tennis',
        'Badminton Singles & Doubles'
      ],
      info: 'Registration Deadline: January 5, 2026\nVenue: Barangay Sports Complex',
      link: '/about'
    },
    {
      id: 8,
      category: 'announcements',
      badge: 'Announcement',
      title: 'Scheduled Water Interruption',
      date: 'Posted: November 28, 2025',
      description: 'Manila Water will conduct maintenance work that will temporarily affect water supply in selected areas.',
      info: 'Date: December 5, 2025\nTime: 10:00 PM - 6:00 AM (next day)\nAffected Areas: Zones 94-96',
      note: 'Reminder: Please store adequate water supply. Water tankers will be available during interruption.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = activeFilter === 'all' 
    ? announcements 
    : announcements.filter(item => item.category === activeFilter);

  return (
    <div className="public-page">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Announcements & Services</h1>
          <p>Stay updated with the latest news, events, and services</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'services' ? 'active' : ''}`}
              onClick={() => setActiveFilter('services')}
            >
              Services Offered
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveFilter('announcements')}
            >
              Announcements
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'events' ? 'active' : ''}`}
              onClick={() => setActiveFilter('events')}
            >
              Events
            </button>
          </div>
        </div>
      </section>

      {/* Announcements Content */}
      <section className="announcements-section">
        <div className="container">
          {loading ? (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <h3>Loading announcements...</h3>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3>{error}</h3>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="announcements-grid">
              {filteredAnnouncements.map((item) => (
                <div key={item.id} className="announcement-card">
                  <div className={`card-badge ${item.category}`}>{item.badge}</div>
                  <div className="card-image">
                    <div className="image-placeholder">{item.badge} Image</div>
                  </div>
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p className="card-date">{item.date}</p>
                    <p>{item.description}</p>
                    {item.items && (
                      <ul className="service-list">
                        {item.items.map((listItem, idx) => (
                          <li key={idx}>{listItem}</li>
                        ))}
                      </ul>
                    )}
                    {item.highlights && (
                      <div className="event-highlights">
                        <h4>Highlights:</h4>
                        <ul>
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.schedule && (
                      <div className="schedule-table">
                        {item.schedule.map((row, idx) => (
                          <div key={idx} className="schedule-row">
                            <strong>{row.label}</strong> {row.value}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.info && (
                      <div className="card-info">
                        {item.info.split('\n').map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <p className="card-note"><strong>Note:</strong> {item.note}</p>
                    )}
                    {item.link && (
                      <a href={item.link} className="btn primary">View All Documents</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
              <h3>No announcements found</h3>
              <p>There are no announcements in this category at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Announcements;

