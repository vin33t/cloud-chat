import React from 'react';
import { User } from './UserList';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ChatHeaderProps {
  selectedUser?: User;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedUser, onClose }) => {
  if (!selectedUser) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {selectedUser.avatar ? (
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-violet-600 font-medium">
              {selectedUser.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h2 className="font-medium">{selectedUser.name}</h2>
          <p className="text-sm text-gray-500">
            {selectedUser.status === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <XMarkIcon className="w-6 h-6 text-gray-500" />
      </button>
    </div>
  );
};

export default ChatHeader;