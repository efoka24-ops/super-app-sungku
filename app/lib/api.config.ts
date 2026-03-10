/**
 * API Configuration for Sungku Super App
 * Centralized API URL management
 */

export const API_CONFIG = {
  // Production - Use environment variable with online fallback
  PRODUCTION: import.meta.env.VITE_API_URL || 'https://super-app-sungku.onrender.com',
  
  // Development - Local
  DEVELOPMENT: 'http://localhost:4000',
  
  // Get current API URL based on environment
  get BASE_URL() {
    const isDev = import.meta.env.MODE === 'development' || !import.meta.env.PROD;
    return isDev ? this.DEVELOPMENT : this.PRODUCTION;
  }
};

export default API_CONFIG;
