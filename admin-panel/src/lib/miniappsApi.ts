import { ADMIN_API_BASE_URL } from './apiBase';

export interface MiniApp {
  id: string;
  name: string;
  category: string;
  description?: string;
  published: boolean;
  featured: boolean;
  installations: number;
  uniqueUsers?: number;
  uniquePhones?: number;
  rating: number;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  uploadedAt?: string;
}

// Get mini-apps catalog
export async function getMiniAppsCatalog(): Promise<MiniApp[]> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/miniapps-catalog`);
    if (!response.ok) throw new Error('Failed to fetch catalog');
    const data = await response.json();
    return data.miniApps || [];
  } catch (error) {
    console.error('Error fetching mini-apps catalog:', error);
    return [];
  }
}

// Create/Add new mini-app
export async function createMiniApp(miniApp: Omit<MiniApp, 'id' | 'installations' | 'rating' | 'uploadedAt'>): Promise<MiniApp | null> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/miniapps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(miniApp)
    });

    if (!response.ok) {
      throw new Error('Failed to create mini-app');
    }

    const data = await response.json();
    return data.miniApp || null;
  } catch (error) {
    console.error('Error creating mini-app:', error);
    return null;
  }
}

// Update mini-app publish status
export async function togglePublishStatus(appId: string, published: boolean): Promise<MiniApp | null> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/miniapps/${appId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ published })
    });

    if (!response.ok) throw new Error('Failed to update publish status');
    const data = await response.json();
    return data.miniApp || null;
  } catch (error) {
    console.error('Error updating publish status:', error);
    return null;
  }
}

// Update mini-app featured status
export async function toggleFeaturedStatus(appId: string, featured: boolean): Promise<MiniApp | null> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/miniapps/${appId}/featured`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ featured })
    });

    if (!response.ok) throw new Error('Failed to update featured status');
    const data = await response.json();
    return data.miniApp || null;
  } catch (error) {
    console.error('Error updating featured status:', error);
    return null;
  }
}

// Delete mini-app
export async function deleteMiniApp(appId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/miniapps/${appId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete mini-app');
    return true;
  } catch (error) {
    console.error('Error deleting mini-app:', error);
    return false;
  }
}
