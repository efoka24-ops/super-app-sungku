const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://super-app-sungku.onrender.com/api" : "http://localhost:4000/api");

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  icon?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  icon?: string;
}

/**
 * Fetch notifications for a user
 * @param filter - "all" | "unread"
 */
export async function fetchNotifications(
  userId: string,
  filter: "all" | "unread" = "all"
): Promise<Notification[]> {
  try {
    const url =
      filter === "unread"
        ? `${API_BASE}/notifications/${userId}?filter=unread`
        : `${API_BASE}/notifications/${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<Notification | null> {
  try {
    const response = await fetch(`${API_BASE}/notifications/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.statusText}`);
    }
    const data = await response.json();
    return data.notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/notifications/${userId}/${notificationId}/read`,
      {
        method: "PATCH",
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/notifications/${userId}/read-all`, {
      method: "PATCH",
    });
    return response.ok;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/notifications/${userId}/${notificationId}`,
      {
        method: "DELETE",
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}
