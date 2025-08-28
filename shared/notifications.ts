export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "security";
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}

export interface MarkAllAsReadResponse {
  success: boolean;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: Notification["type"];
  actionUrl?: string;
  actionText?: string;
  userId?: string; // If targeting specific user
}
