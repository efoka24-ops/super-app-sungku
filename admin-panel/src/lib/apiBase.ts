const rawBase =
	(import.meta.env.VITE_API_BASE as string | undefined) ||
	 (import.meta.env.PROD ? 'https://super-app-sungku-7wq4.onrender.com' : 'http://localhost:4000');

const normalizedBase = rawBase.replace(/\/$/, '');

export const ADMIN_API_BASE_URL = `${normalizedBase}/api/admin`;
