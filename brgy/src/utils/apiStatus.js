// Utility to check API connection status

const API_BASE_URL = 'http://127.0.0.1:3001/api';

export const checkApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getApiStatus = async () => {
  const isConnected = await checkApiConnection();
  return {
    connected: isConnected,
    baseUrl: API_BASE_URL,
    message: isConnected 
      ? 'Connected to database' 
      : 'Cannot connect to backend. Please make sure the server is running on http://127.0.0.1:3001'
  };
};

