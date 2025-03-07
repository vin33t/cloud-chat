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

const DUMMY_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    status: 'online',
    lastSeen: new Date(),
    unreadCount: 2,
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6d28d9&color=fff',
  },
  {
    id: '2',
    name: 'Jane Smith',
    status: 'away',
    lastSeen: new Date(Date.now() - 1000 * 60 * 5),
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=6d28d9&color=fff',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=6d28d9&color=fff',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    status: 'online',
    lastSeen: new Date(),
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=6d28d9&color=fff',
  },
  {
    id: '5',
    name: 'David Brown',
    status: 'away',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
    unreadCount: 1,
    avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=6d28d9&color=fff',
  },
  {
    id: '6',
    name: 'Emma Davis',
    status: 'online',
    lastSeen: new Date(),
    avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=6d28d9&color=fff',
  },
  {
    id: '7',
    name: 'Alex Turner',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 120),
    avatar: 'https://ui-avatars.com/api/?name=Alex+Turner&background=6d28d9&color=fff',
  },
  {
    id: '8',
    name: 'Olivia Parker',
    status: 'online',
    lastSeen: new Date(),
    unreadCount: 3,
    avatar: 'https://ui-avatars.com/api/?name=Olivia+Parker&background=6d28d9&color=fff',
  },
];

const DUMMY_MESSAGES: { [key: string]: string[] } = {
  '1': [
    'Hey there!',
    'How are you doing?',
    'Did you check out the new project?',
  ],
  '2': [
    'Hi! Can we discuss the meeting tomorrow?',
    'I have some ideas to share.',
  ],
  '5': [
    'Hello! Just wanted to follow up on our discussion.',
    'I've prepared the documents you requested.',
  ],
  '8': [
    'Hey! Are you available for a quick call?',
    'We need to review the latest changes.',
    'I've found some interesting patterns we should discuss.',
  ],
};

const Chat: React.FC = () => {
  const [users] = useState<User[]>(DUMMY_USERS);
  const [messages, setMessages] = useState<{ [key: string]: MessageProps[] }>(
    Object.fromEntries(
      DUMMY_USERS.map(user => [
        user.id,
        (DUMMY_MESSAGES[user.id] || []).map((content, index) => ({
          id: `${user.id}-${index}`,
          content,
          senderId: index % 2 === 0 ? user.id : 'currentUser',
          receiverId: index % 2 === 0 ? 'currentUser' : user.id,
          timestamp: new Date(Date.now() - (1000 * 60 * (30 - index))),
        }))
      ])
    )
  );

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
      senderId: 'currentUser',
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
                  Select a user from the left to start chatting or create a new chat
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