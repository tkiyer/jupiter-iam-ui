import { RequestHandler } from "express";
import {
  Notification,
  NotificationResponse,
  MarkAsReadRequest,
  MarkAllAsReadResponse,
  CreateNotificationRequest,
} from "@shared/notifications";

// Mock data - in a real app this would come from a database
let mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Security Alert",
    message: "Detected login attempt from unknown device",
    type: "security",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    actionUrl: "/audit",
    actionText: "View Details",
  },
  {
    id: "2",
    title: "System Update",
    message: "IAM system successfully updated to version 2.1.0 with new security features",
    type: "success",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    title: "Policy Conflict Detection",
    message: "Potential conflicts found in user permission policies, immediate attention required",
    type: "warning",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actionUrl: "/policies",
    actionText: "Resolve Conflicts",
  },
  {
    id: "4",
    title: "Backup Complete",
    message: "System data backup completed successfully, all data is secure",
    type: "info",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "5",
    title: "User Permission Review",
    message: "Administrator permissions for John Smith will expire in 7 days, renewal required",
    type: "warning",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    actionUrl: "/users",
    actionText: "Manage Permissions",
  },
];

// Get all notifications
export const getNotifications: RequestHandler = (req, res) => {
  try {
    // Sort by creation date (newest first)
    const sortedNotifications = [...mockNotifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    const response: NotificationResponse = {
      notifications: sortedNotifications,
      unreadCount,
      total: mockNotifications.length,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark notifications as read
export const markAsRead: RequestHandler = (req, res) => {
  try {
    const { notificationIds }: MarkAsReadRequest = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ error: "Invalid notification IDs" });
    }

    mockNotifications = mockNotifications.map((notification) =>
      notificationIds.includes(notification.id)
        ? { ...notification, isRead: true }
        : notification,
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};

// Mark all notifications as read
export const markAllAsRead: RequestHandler = (req, res) => {
  try {
    mockNotifications = mockNotifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    const response: MarkAllAsReadResponse = { success: true };
    res.json(response);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Delete single notification
export const deleteNotification: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const notificationExists = mockNotifications.some((n) => n.id === id);
    if (!notificationExists) {
      return res.status(404).json({ error: "Notification not found" });
    }

    mockNotifications = mockNotifications.filter((n) => n.id !== id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Clear all notifications
export const clearAllNotifications: RequestHandler = (req, res) => {
  try {
    mockNotifications = [];
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    res.status(500).json({ error: "Failed to clear all notifications" });
  }
};

// Create new notification (for system use)
export const createNotification: RequestHandler = (req, res) => {
  try {
    const {
      title,
      message,
      type,
      actionUrl,
      actionText,
      userId,
    }: CreateNotificationRequest = req.body;

    if (!title || !message || !type) {
      return res
        .status(400)
        .json({ error: "Title, message, and type are required" });
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      actionUrl,
      actionText,
    };

    mockNotifications.unshift(newNotification); // Add to beginning of array

    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};
