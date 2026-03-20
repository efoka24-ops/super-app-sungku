// --- Supabase config for mobile app ---
export const SUPABASE_URL = 'https://uybhscmvncjxsokzgyuu.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmhzY212bmNqeHNva3pneXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjUwNjksImV4cCI6MjA4ODc0MTA2OX0.PQO3DcQQ9Rt0WDg2wnZ-MsFaE8NrBZTZYXyNyJAs27M';
/**
 * API Configuration
 * Central place to manage backend URLs
 */

export const API_CONFIG = {
  // Use explicit env var, otherwise fallback by environment
  BACKEND_URL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACK4APP_URL ||
    (import.meta.env.PROD ? 'https://super-app-sungku-7wq4.onrender.com' : 'http://localhost:4000'),
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
