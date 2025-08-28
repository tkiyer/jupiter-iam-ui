import React from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Shield,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Notification } from "@shared/notifications";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "security":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer",
        !notification.isRead && "bg-blue-50/50",
      )}
      onClick={handleAction}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between">
          <p
            className={cn(
              "text-sm font-medium text-gray-900 leading-5",
              !notification.isRead && "font-semibold",
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
          )}
        </div>

        <p className="text-sm text-gray-600 leading-5">
          {notification.message}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>

          {notification.actionText && notification.actionUrl && (
            <div className="flex items-center text-xs text-blue-600">
              <span>{notification.actionText}</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            title="标记为已读"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title="删除通知"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

interface NotificationsDropdownProps {
  className?: string;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  className,
}) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("p-2 relative", className)}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900">通知</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                全部已读
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                清空
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">暂无通知</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 3 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-blue-600 hover:text-blue-700"
              >
                查看所有通知
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
