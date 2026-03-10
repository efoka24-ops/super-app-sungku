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
  otp: string;
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(`Connexion backend impossible (${API_BASE}/auth/signup)`);
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw error;
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signin failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Signin error:", error);
    throw error;
  }
}
