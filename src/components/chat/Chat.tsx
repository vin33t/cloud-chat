import React, { useState, useCallback, useRef, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import UserList, { User } from './UserList';
import ChatHeader from './ChatHeader';
import NotificationSystem, { showNotification } from './NotificationSystem';
import { playMessageSentSound, playMessageReceivedSound } from '../../utils/sounds';

export interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'video';
    url: string;
  }>;
}

const Chat: React.FC = () => {
  // Mock users data - In a real app, this would come from an API
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      status: 'online',
      lastSeen: new Date(),
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Jane Smith',
      status: 'away',
      lastSeen: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '3',
      name: 'Mike Johnson',
      status: 'offline',
      lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]);

  const [messages, setMessages] = useState<{ [key: string]: MessageProps[] }>({
    '1': [],
    '2': [],
    '3': [],
  });
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [isTyping, setIsTyping] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const selectedUser = users.find(user => user.id === selectedUserId);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedUserId) return;

    const newMessage: MessageProps = {
      id: Date.now().toString(),
      content,
      senderId: 'currentUser', // In a real app, this would be the logged-in user's ID
      receiverId: selectedUserId,
      timestamp: new Date(),
    };

    if (attachments?.length) {
      newMessage.attachments = await Promise.all(
        attachments.map(async (file) => ({
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: URL.createObjectURL(file),
        }))
      );
    }

    setMessages(prev => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), newMessage],
    }));
    playMessageSentSound();

    // Simulate received message
    setTimeout(() => {
      const receivedMessage: MessageProps = {
        id: Date.now().toString(),
        content: 'This is a simulated response',
        senderId: selectedUserId,
        receiverId: 'currentUser',
        timestamp: new Date(),
      };

      setMessages(prev => ({
        ...prev,
        [selectedUserId]: [...(prev[selectedUserId] || []), receivedMessage],
      }));
      playMessageReceivedSound();

      if (document.hidden && notificationPermission === 'granted') {
        showNotification(`New message from ${selectedUser?.name}`, {
          body: receivedMessage.content,
        });
      }
    }, 1000);
  };

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedUserId(undefined);
  }, []);

  const handleNotificationPermissionChange = useCallback((permission: NotificationPermission) => {
    setNotificationPermission(permission);
  }, []);

  return (
    <>
      <NotificationSystem onNotificationPermissionChange={handleNotificationPermissionChange} />
      <div className="flex h-screen bg-gray-100">
        <UserList
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={handleSelectUser}
        />
        {selectedUserId ? (
          <div className="flex-1 flex flex-col">
            <ChatHeader selectedUser={selectedUser} onClose={handleClose} />
            <ChatWindow
              messages={messages[selectedUserId] || []}
              isTyping={isTyping}
              currentUserId="currentUser"
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!selectedUserId}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-600 mb-2">
                Select a user to start chatting
              </h2>
              <p className="text-gray-500">
                Choose from the list of available users on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;