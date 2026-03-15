import { parseJsonSafe, toUserErrorMessage } from "./errorMessages";

const rawApiUrl =
  import.meta.env.DEV
    ? "/api"
    : (import.meta.env.VITE_API_URL as string | undefined) || "https://super-app-sungku.onrender.com";
const normalizedBase = rawApiUrl.replace(/\/$/, "");
const API_BASE = normalizedBase.endsWith("/api") ? normalizedBase : `${normalizedBase}/api`;

interface SignupRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
}

interface SignupResponse {
  userId: string;
  otp?: string;
  message: string;
}

interface VerifyOtpRequest {
  userId: string;
  otp: string;
}

interface VerifyOtpResponse {
  message: string;
  userId: string;
  token: string;
}

/**
 * Sign up new user
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
      const message =
        typeof payload.message === "string" && payload.message.trim().length > 0
          ? payload.message
          : `Erreur ${response.status} sur ${API_BASE}/auth/signup`;
      throw new Error(message);
    }

    return payload as SignupResponse;
  } catch (error) {
    throw new Error(toUserErrorMessage(error, "Inscription impossible pour le moment."));
  }
}

/**
 * Verify OTP
 */
export async function verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
      const message =
        typeof payload.message === "string" && payload.message.trim().length > 0
          ? payload.message
          : `Erreur ${response.status} sur ${API_BASE}/auth/verify-otp`;
      throw new Error(message);
    }

    return payload as VerifyOtpResponse;
  } catch (error) {
    throw new Error(toUserErrorMessage(error, "Verification du code impossible."));
  }
}

/**
 * Sign in user
 */
export async function signin(login: string, password: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
      const message =
        typeof payload.message === "string" && payload.message.trim().length > 0
          ? payload.message
          : `Erreur ${response.status} sur ${API_BASE}/auth/signin`;
      throw new Error(message);
    }

    return payload;
  } catch (error) {
    throw new Error(toUserErrorMessage(error, "Connexion impossible pour le moment."));
  }
}
