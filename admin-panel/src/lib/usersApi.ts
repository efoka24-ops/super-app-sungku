const API_BASE_URL = 'http://localhost:4000/api/admin';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  verified: boolean;
  createdAt: string;
  status?: 'active' | 'suspended' | 'blocked';
  kycLevel?: 'none' | 'basic' | 'advanced';
  balance?: number;
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch users');
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(userId: string, status: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to update user status');
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
}

/**
 * Get user stats
 */
export async function getUserStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}
