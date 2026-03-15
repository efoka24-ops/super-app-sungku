/**
 * API Configuration
 * Central place to manage backend URLs
 */

export const API_CONFIG = {
  // Use explicit env var, otherwise fallback by environment
  BACKEND_URL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACK4APP_URL ||
    (import.meta.env.PROD ? 'https://super-app-sungku.onrender.com' : 'http://localhost:4000'),
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
