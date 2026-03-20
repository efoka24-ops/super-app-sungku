/**
 * API Configuration for Sungku Super App
 * Centralized API URL management
 */

export const API_CONFIG = {
  // Production - Render (keeps legacy env var compatibility)
  PRODUCTION:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACK4APP_URL ||
    'https://super-app-sungku-7wq4.onrender.com',

  // Development - Local
  DEVELOPMENT: 'http://localhost:4000',
  
  // Get current API URL based on environment
  get BASE_URL() {
    const isDev = import.meta.env.MODE === 'development' || !import.meta.env.PROD;
    return isDev ? this.DEVELOPMENT : this.PRODUCTION;
  }
};

export default API_CONFIG;
