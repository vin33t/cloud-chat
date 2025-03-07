import React, { useEffect } from 'react';

interface NotificationSystemProps {
  onNotificationPermissionChange: (permission: NotificationPermission) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  onNotificationPermissionChange,
}) => {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        onNotificationPermissionChange(permission);
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    if (Notification.permission === 'default') {
      requestNotificationPermission();
    } else {
      onNotificationPermissionChange(Notification.permission);
    }
  }, [onNotificationPermissionChange]);

  return null; // This is a utility component, no UI needed
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};

export default NotificationSystem;