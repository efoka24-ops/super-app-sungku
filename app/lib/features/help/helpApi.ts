const API_BASE = "http://localhost:4000/api";

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
