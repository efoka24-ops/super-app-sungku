const rawBase =
	(import.meta.env.VITE_API_BASE as string | undefined) ||
	(import.meta.env.PROD ? 'https://sungku1-q3j44yhv.b4a.run' : 'http://localhost:4000');

const normalizedBase = rawBase.replace(/\/$/, '');

export const ADMIN_API_BASE_URL = `${normalizedBase}/api/admin`;
