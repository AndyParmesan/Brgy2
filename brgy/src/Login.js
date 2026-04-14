import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import logoBrgy from './assets/logo-brgy.png';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  // Registration form fields (for residents)
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
    agreeTerms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API login - checks users table in database
      const API_BASE_URL = '/api';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Login failed';
          errorDetails = errorData.error || '';
          
          // Provide specific feedback based on error type
          if (errorDetails === 'Account not found') {
            errorMessage = 'Account not found. No user exists with this email address.';
          } else if (errorDetails === 'Invalid password') {
            errorMessage = 'Incorrect password. Please check your password and try again.';
          } else if (errorDetails === 'Database connection failed') {
            errorMessage = 'Cannot connect to database. Please contact the administrator.';
          }
        } catch (e) {
          errorMessage = response.statusText || 'Login failed';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Verify we got user data
      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call parent callback
      onLogin(data.user, data.token);
      setLoading(false);
      
      // Redirect based on user role
      if (data.user.role === 'resident') {
        navigate('/resident-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:3001');
      } else {
        // Display the specific error message from the backend
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
  };

  const handleRegChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleRegPhoneChange = (e) => {
// 1. Remove all non-numeric characters
    let cleaned = e.target.value.replace(/\D/g, '');
    
    // 2. AUTO-FORCE "09" AT THE START
    if (cleaned.length > 0) {
      if (cleaned[0] !== '0') {
        cleaned = '09' + cleaned; // If they type '1', it becomes '091'
      } else if (cleaned.length > 1 && cleaned[1] !== '9') {
        cleaned = '09' + cleaned.substring(1); // If they type '08', it forces '098'
      }
    }

    let formatted = cleaned;
    // ... the rest of the formatting (length > 4, etc.) stays exactly the same

    // Assuming your registration state is called regData and the field is contactNumber.
    // If your state is named differently, update 'setRegData' to match!
    setRegData(prev => ({
      ...prev,
      contactNumber: formatted 
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (regData.password !== regData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (regData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!regData.agreeTerms) {
        throw new Error('You must agree to the terms and conditions');
      }

      // Register resident
      const API_BASE_URL = '/api';
      const response = await fetch(`${API_BASE_URL}/public/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          first_name: regData.firstName,
          last_name: regData.lastName,
          email: regData.email,
          password: regData.password,
          contact_number: regData.contactNumber,
          address: regData.address,
          date_of_birth: regData.dateOfBirth || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Registration failed';
        } catch (e) {
          errorMessage = response.statusText || 'Registration failed';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess('Account created successfully! Redirecting to your dashboard...');
      
      // Store email and password before clearing form
      const userEmail = regData.email;
      const userPassword = regData.password;
      
      // Clear form
      setRegData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        address: '',
        dateOfBirth: '',
        agreeTerms: false
      });

      // Auto-login and redirect to resident dashboard after 1.5 seconds
      setTimeout(async () => {
        try {
          // Auto-login the newly created user
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ 
              email: userEmail, 
              password: userPassword 
            }),
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            localStorage.setItem('auth_token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            onLogin(loginData.user, loginData.token);
            navigate('/resident-dashboard');
          } else {
            // If auto-login fails, just switch to login mode
            setMode('login');
            setEmail(userEmail);
            setSuccess('Account created successfully! Please login.');
          }
        } catch (err) {
          // If auto-login fails, just switch to login mode
          setMode('login');
          setEmail(userEmail);
          setSuccess('Account created successfully! Please login.');
        }
      }, 1500);

    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:3001');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logoBrgy} alt="Brgy. 853 Zone 93" className="login-logo" />
          <h1>Brgy. 853 Zone 93</h1>
          <p className="login-subtitle">Tulong-Tulong Sama-Sama</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-firstname">First Name <span className="required">*</span></label>
                <input
                  id="reg-firstname"
                  type="text"
                  name="firstName"
                  value={regData.firstName}
                  onChange={handleRegChange}
                  required
                  placeholder="First name"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-lastname">Last Name <span className="required">*</span></label>
                <input
                  id="reg-lastname"
                  type="text"
                  name="lastName"
                  value={regData.lastName}
                  onChange={handleRegChange}
                  required
                  placeholder="Last name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address <span className="required">*</span></label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={regData.email}
                onChange={handleRegChange}
                required
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-contact">Contact Number <span className="required">*</span></label>
              <input
               id="reg-contact" /* <-- Keeps the label click working */
                type="tel"
                name="contactNumber"
                value={regData.contactNumber}
                onChange={handleRegPhoneChange} 
                placeholder="09XX-XXX-XXXX"
                pattern="^09\d{2}-\d{3}-\d{4}$" 
                title="Phone number must start with 09 and follow the format 09XX-XXX-XXXX"
                required
                disabled={loading} /* <-- Locks the input when submitting */
            />
            </div>

            <div className="form-group">
              <label htmlFor="reg-address">Address <span className="required">*</span></label>
              <input
                id="reg-address"
                type="text"
                name="address"
                value={regData.address}
                onChange={handleRegChange}
                required
                placeholder="Complete address" /* <--- CHANGE THIS BACK */
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-dob">Date of Birth</label>
              <input
                id="reg-dob"
                type="date"
                name="dateOfBirth"
                value={regData.dateOfBirth}
                onChange={handleRegChange}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password <span className="required">*</span></label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  value={regData.password}
                  onChange={handleRegChange}
                  required
                  placeholder="At least 6 characters"
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password <span className="required">*</span></label>
                <input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  value={regData.confirmPassword}
                  onChange={handleRegChange}
                  required
                  placeholder="Re-enter password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={regData.agreeTerms}
                  onChange={handleRegChange}
                  required
                  disabled={loading}
                />
                <span>I agree to the terms and conditions</span>
              </label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Create Account Button - On login-card, always visible in login mode */}
        {mode === 'login' && (
          <div className="login-create-section">
            <button
              type="button"
              className="create-account-btn"
              onClick={() => handleModeChange('register')}
              disabled={loading}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="login-footer">
          <Link to="/" className="home-btn">
            ← Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
