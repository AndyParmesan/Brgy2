// API helper utility for making authenticated requests

const API_BASE_URL = '/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Make an authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

/**
 * API endpoints
 */
export const api = {
  // Auth
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => 
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getUser: () => 
    apiRequest('/auth/user'),

  // Residents
  getResidents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/residents${queryString ? `?${queryString}` : ''}`);
  },

  // Document Requests
  getDocumentRequests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/document-requests${queryString ? `?${queryString}` : ''}`);
  },

  // Blotter Cases
  getBlotterCases: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/blotter-cases${queryString ? `?${queryString}` : ''}`);
  },

  // Announcements
  getAnnouncements: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/announcements${queryString ? `?${queryString}` : ''}`);
  },

  // Activity Logs
  getActivityLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/activity-logs${queryString ? `?${queryString}` : ''}`);
  },

  // Public endpoints (no authentication required)
  getPublicAnnouncements: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/public/announcements${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Transform API data to match frontend format
      return data.map(item => ({
        id: item.id,
        category: item.category || 'announcements',
        badge: item.category === 'services' ? 'Service' : item.category === 'events' ? 'Event' : 'Announcement',
        title: item.title,
        date: item.published_on ? `Posted: ${new Date(item.published_on).toLocaleDateString()}` : 'Available Daily',
        description: item.summary || item.body || '',
        body: item.body,
        published_on: item.published_on,
        expires_on: item.expires_on,
        target_audience: item.target_audience,
        priority: item.priority || 'Normal',
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  getPublicDocuments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  submitReport: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  submitDocumentRequest: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/document-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting document request:', error);
      throw error;
    }
  },

  submitContact: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  },
};

