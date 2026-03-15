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
  CINETPAY_CONFIG: '/api/cinetpay/config',
  CINETPAY_INITIATE: '/api/cinetpay/initiate',
  CINETPAY_CHECK: (transactionId: string) => `/api/cinetpay/check/${transactionId}`,
  // Transfer (payout) API — client.cinetpay.com via backend proxy
  CINETPAY_TRANSFER_CONFIG: '/api/cinetpay-transfer/config',
  CINETPAY_TRANSFER_LOGIN: '/api/cinetpay-transfer/login',
  CINETPAY_TRANSFER_CONTACTS: '/api/cinetpay-transfer/contacts',
  CINETPAY_TRANSFER_SEND: '/api/cinetpay-transfer/send',
  CINETPAY_TRANSFER_CHECK: (transactionId: string) => `/api/cinetpay-transfer/check/${transactionId}`,
  NOTCHPAY_TRANSFER_CONFIG: '/api/notchpay-transfer/config',
  NOTCHPAY_TRANSFER_SEND: '/api/notchpay-transfer/send',
  NOTCHPAY_TRANSFER_CHECK: (reference: string) => `/api/notchpay-transfer/check/${reference}`,
  NOTCHPAY_TRANSFER_CANCEL: (reference: string) => `/api/notchpay-transfer/cancel/${reference}`,
  NOTCHPAY_TRANSFER_HISTORY: (userId: string) => `/api/notchpay-transfer/history/${userId}`,
  NOTCHPAY_PAYMENTS_CONFIG: '/api/notchpay-payments/config',
  NOTCHPAY_PAYMENTS_LIST: '/api/notchpay-payments/list',
  NOTCHPAY_PAYMENTS_CREATE: '/api/notchpay-payments/create',
  NOTCHPAY_PAYMENTS_CHECK: (reference: string) => `/api/notchpay-payments/check/${reference}`,
  NOTCHPAY_PAYMENTS_PROCESS: (reference: string) => `/api/notchpay-payments/process/${reference}`,
  NOTCHPAY_PAYMENTS_CANCEL: (reference: string) => `/api/notchpay-payments/cancel/${reference}`,
  NOTCHPAY_CUSTOMERS_CONFIG: '/api/notchpay-customers/config',
  NOTCHPAY_CUSTOMERS_LIST: '/api/notchpay-customers/list',
  NOTCHPAY_CUSTOMERS_CREATE: '/api/notchpay-customers/create',
  NOTCHPAY_CUSTOMERS_DETAIL: (id: string) => `/api/notchpay-customers/${id}`,
  NOTCHPAY_CUSTOMERS_PAYMENTS: (id: string) => `/api/notchpay-customers/${id}/payments`,
  NOTCHPAY_BENEFICIARIES_CONFIG: '/api/notchpay-beneficiaries/config',
  NOTCHPAY_BENEFICIARIES_LIST: '/api/notchpay-beneficiaries/list',
  NOTCHPAY_BENEFICIARIES_CREATE: '/api/notchpay-beneficiaries/create',
  NOTCHPAY_BENEFICIARIES_DETAIL: (id: string) => `/api/notchpay-beneficiaries/${id}`,
};

export default API_CONFIG;
