// src/config.js

// If you have REACT_APP_API_BASE_URL defined (e.g., in .env),
// use that. Otherwise, fall back to localhost for development.
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Fallback: if NODE_ENV is production but no REACT_APP_API_BASE_URL was provided,
  // you might want to hardcode your production URL here.
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-production-backend.com';
  }

  // Default for local development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();
