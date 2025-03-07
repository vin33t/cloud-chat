import React, { useState, useCallback, useRef } from 'react';
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
    {
      id: '4',
      name: 'Sarah Wilson',
      status: 'online',
      lastSeen: new Date(),
    },
    {
      id: '5',
      name: 'David Brown',
      status: 'away',
      lastSeen: new Date(Date.now() - 1000 * 60 * 15),
      unreadCount: 1,
    },
  ]);

  const [messages, setMessages] = useState<{ [key: string]: MessageProps[] }>({
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
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
        {/* Left Panel - User List */}
        <div className="w-80 h-full flex-shrink-0 bg-violet-900">
          <UserList
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h2 className="text-2xl font-medium text-gray-600 mb-2">
                  Welcome to Cloud Chat
                </h2>
                <p className="text-gray-500 mb-4">
                  Select a user from the left to start chatting
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-500">Online</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-500">Away</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span className="text-sm text-gray-500">Offline</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;