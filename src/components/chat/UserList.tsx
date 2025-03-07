import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  unreadCount?: number;
  isTyping?: boolean;
}

interface UserListProps {
  users: User[];
  selectedUserId?: string;
  onSelectUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser }) => {
  return (
    <div className="w-80 bg-violet-900 text-white h-full overflow-y-auto">
      <div className="p-4 border-b border-violet-800">
        <h2 className="text-xl font-semibold">Users</h2>
      </div>
      <div className="divide-y divide-violet-800">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-violet-800 transition-colors ${
              selectedUserId === user.id ? 'bg-violet-800' : ''
            }`}
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-violet-300" />
              )}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-violet-900 ${
                  user.status === 'online'
                    ? 'bg-green-500'
                    : user.status === 'away'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium">{user.name}</h3>
              {user.isTyping ? (
                <p className="text-sm text-violet-300">Typing...</p>
              ) : user.lastSeen ? (
                <p className="text-sm text-violet-300">
                  Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                </p>
              ) : null}
            </div>
            {user.unreadCount ? (
              <div className="bg-violet-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {user.unreadCount}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserList;