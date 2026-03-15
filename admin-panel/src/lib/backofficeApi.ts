import { ADMIN_API_BASE_URL } from './apiBase';

export interface DetailedUser {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'suspended' | 'blocked';
  kycLevel?: 'none' | 'basic' | 'advanced';
  balance?: number;
  verified?: boolean;
  createdAt?: string;
}

export interface UploadedApk {
  fileName: string;
  originalName: string;
  size: number;
  url: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export async function getUserDetail(userId: string): Promise<DetailedUser | null> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user detail');
    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return null;
  }
}

export async function updateUserDetail(userId: string, payload: Partial<DetailedUser>): Promise<DetailedUser | null> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update user detail');
    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error updating user detail:', error);
    return null;
  }
}

export async function uploadMiniAppApk(file: File): Promise<UploadedApk | null> {
  try {
    const body = new FormData();
    body.append('apk', file);

    const response = await fetch(`${ADMIN_API_BASE_URL}/miniapps/upload`, {
      method: 'POST',
      body
    });

    if (!response.ok) throw new Error('Failed to upload APK');
    const data = await response.json();
    return {
      fileName: data.fileName,
      originalName: data.originalName,
      size: data.size,
      url: data.url
    };
  } catch (error) {
    console.error('Error uploading APK:', error);
    return null;
  }
}

export async function getAllNotifications() {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/notifications`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [] };
  }
}

export async function sendNotification(payload: {
  target: 'single' | 'all';
  userId?: string;
  title: string;
  message: string;
  type?: string;
}) {
  const response = await fetch(`${ADMIN_API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
  return response.json();
}

export async function getMessagesSummary() {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/messages/conversations`);
    if (!response.ok) throw new Error('Failed to fetch messages summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages summary:', error);
    return { users: [] };
  }
}

export async function getFaq(lang: 'fr' | 'en') {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/faq?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to fetch FAQ');
    return await response.json();
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return { items: [] };
  }
}

export async function createFaq(lang: 'fr' | 'en', question: string, answer: string) {
  const response = await fetch(`${ADMIN_API_BASE_URL}/faq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang, question, answer })
  });
  if (!response.ok) throw new Error('Failed to create FAQ');
  return response.json();
}

export async function deleteFaq(lang: 'fr' | 'en', itemId: string) {
  const response = await fetch(`${ADMIN_API_BASE_URL}/faq/${itemId}?lang=${lang}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete FAQ');
  return response.json();
}

export async function updateFaq(lang: 'fr' | 'en', itemId: string, question: string, answer: string) {
  const response = await fetch(`${ADMIN_API_BASE_URL}/faq/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang, question, answer })
  });
  if (!response.ok) throw new Error('Failed to update FAQ');
  return response.json();
}
