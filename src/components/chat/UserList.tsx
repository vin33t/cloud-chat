import React, { useState } from 'react';
import { UserCircleIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';

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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Create Chat button */}
      <div className="p-4 border-b border-violet-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserCircleIcon className="w-6 h-6" />
            Contacts
          </h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 bg-violet-700 hover:bg-violet-600 rounded-full text-white transition-colors"
            title="Create New Chat"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-violet-800 text-white placeholder-violet-300 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-violet-300 absolute left-2 top-2.5" />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-violet-800">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-violet-800 transition-colors ${
                selectedUserId === user.id ? 'bg-violet-800' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-violet-700 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
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
                <h3 className="font-medium text-white">{user.name}</h3>
                {user.isTyping ? (
                  <p className="text-sm text-violet-300">Typing...</p>
                ) : user.lastSeen ? (
                  <p className="text-sm text-violet-300">
                    {user.status === 'online'
                      ? 'Online'
                      : `Last seen: ${new Date(user.lastSeen).toLocaleTimeString()}`}
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

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-2 top-2.5" />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user.id);
                    setShowNewChatModal(false);
                  }}
                  className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-violet-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        user.status === 'online'
                          ? 'bg-green-500'
                          : user.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                      {user.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;