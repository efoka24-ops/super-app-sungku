import API_CONFIG from "../../config";

const API_BASE = `${API_CONFIG.BACKEND_URL.replace(/\/$/, "")}/api`;

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

/**
 * Fetch FAQ items by language
 */
export async function fetchFAQ(language: "fr" | "en"): Promise<FAQ[]> {
  try {
    const response = await fetch(`${API_BASE}/help/faq?lang=${language}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch FAQ: ${response.statusText}`);
    }
    const data = await response.json();
    return data.faqs || [];
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return [];
  }
}
