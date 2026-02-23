import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navigation.css';
import logoBrgy from '../assets/logo-brgy.png';

const Navigation = ({ user: propUser, onLogout: propOnLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser || null);

  // Get user from localStorage if not provided as prop
  useEffect(() => {
    if (!propUser) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      }
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleAvatarClick = () => {
    if (user?.role === 'resident') {
      navigate('/resident-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    if (propOnLogout) {
      await propOnLogout();
    } else {
      // Fallback: clear localStorage and reload
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!user;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">
          <img src={logoBrgy} alt="Barangay 853 Logo" className="nav-logo" />
          <span className="brand-name">Barangay 853</span>
        </div>
        <ul className="nav-menu">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/documents" className={isActive('/documents')}>Documents</Link></li>
          <li><Link to="/announcements" className={isActive('/announcements')}>Announcements</Link></li>
          <li><Link to="/report" className={isActive('/report')}>Report</Link></li>
          <li><Link to="/about" className={isActive('/about')}>About</Link></li>
          {isAuthenticated ? (
            <li className="nav-user-menu">
              <div className="user-avatar-nav" onClick={handleAvatarClick} title="Go to Dashboard">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user?.name || 'User'} 
                    className="avatar-img-nav"
                  />
                ) : (
                  <span className="avatar-initial">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar-nav">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user?.name || 'User'} 
                        className="avatar-img-nav"
                      />
                    ) : (
                      <span className="avatar-initial">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="user-info-nav">
                    <p className="user-name-nav">{user?.name || 'User'}</p>
                    <p className="user-role-nav">{user?.role || 'User'}</p>
                  </div>
                </div>
                <div className="user-dropdown-menu">
                  <button onClick={handleAvatarClick} className="dropdown-item">
                    Dashboard
                  </button>
                  <button onClick={() => navigate('/profile')} className="dropdown-item">
                    Profile
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              </div>
            </li>
          ) : (
            <li><Link to="/login" className="btn-login">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

