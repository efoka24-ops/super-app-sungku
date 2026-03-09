/**
 * API Configuration
 * Central place to manage backend URLs
 */

export const API_CONFIG = {
  // Back4App Backend URL
    BACKEND_URL: 'https://sungku1-q3j44yhv.b4a.run',
  
  // Alternative: Use environment variable if available
    // BACKEND_URL: import.meta.env.VITE_API_URL || 'https://sungku1-q3j44yhv.b4a.run',
};

// Build full API endpoint
export const buildApiUrl = (path: string): string => {
  const basePath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.BACKEND_URL}${basePath}`;
};

// Common endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  LOGIN: '/api/auth/login',
  USERS: '/api/admin/users',
  PROFILE: (userId: string) => `/api/profile/${userId}`,
  STATS: (userId: string) => `/api/profile/${userId}/stats`,
  AVATAR: (userId: string) => `/api/profile/${userId}/avatar`,
  MESSAGES: (userId: string) => `/api/messages/${userId}`,
  MESSAGES_CONVERSATION: (userId: string, conversationId: string) => 
    `/api/messages/${userId}/${conversationId}`,
  SEND_MESSAGE: (userId: string, conversationId: string) => 
    `/api/messages/${userId}/${conversationId}/send`,
  MINIAPPS: '/api/miniapps',
  CONTACTS: '/api/contacts',
  NOTIFICATIONS: '/api/notifications',
};

export default API_CONFIG;
