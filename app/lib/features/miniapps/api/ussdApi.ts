import API_CONFIG from "../../../config";

const API_BASE = `${API_CONFIG.BACKEND_URL.replace(/\/$/, "")}/api/ussd`;

interface USSDRequest {
  phoneNumber: string;
  operator: string;
  amount?: number;
  description?: string;
}

interface USSDResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  operator: string;
  phoneNumber: string;
  timestamp: string;
  code?: string; // Reponse code from USSD
}

/**
 * Lance une requête USSD au backend
 */
export async function initiateUSSD(
  phoneNumber: string,
  operator: string,
  amount?: number,
  description?: string
): Promise<USSDResponse> {
  try {
    const payload: USSDRequest = {
      phoneNumber,
      operator,
      amount,
      description
    };

    const response = await fetch(`${API_BASE}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`USSD request failed: ${response.statusText}`);
    }

    const data: USSDResponse = await response.json();
    return data;
  } catch (error) {
    console.error('USSD API Error:', error);
    throw error;
  }
}

/**
 * Obtient l'historique des transactions USSD
 */
export async function getUSSDHistory(
  userId: string,
  limit: number = 10
): Promise<USSDResponse[]> {
  try {
    const response = await fetch(
      `${API_BASE}/history/${userId}?limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch USSD history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching USSD history:', error);
    throw error;
  }
}

/**
 * Vérifie le statut d'une transaction USSD
 */
export async function checkUSSDStatus(
  transactionId: string
): Promise<USSDResponse> {
  try {
    const response = await fetch(
      `${API_BASE}/status/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check USSD status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking USSD status:', error);
    throw error;
  }
}

/**
 * Annule une transaction USSD en cours
 */
export async function cancelUSSD(transactionId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_BASE}/cancel/${transactionId}`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel USSD');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling USSD:', error);
    throw error;
  }
}
