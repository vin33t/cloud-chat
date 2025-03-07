import React, { useEffect, useRef } from 'react';
import { MessageProps } from './Chat';

interface ChatWindowProps {
  messages: MessageProps[];
  isTyping?: boolean;
  currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUserId
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p>{message.content}</p>
              {message.attachments?.map((attachment, index) => (
                <div key={index} className="mt-2">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt="Attachment"
                      className="rounded-lg max-w-full"
                    />
                  ) : (
                    <video
                      src={attachment.url}
                      controls
                      className="rounded-lg max-w-full"
                    />
                  )}
                </div>
              ))}
              <div
                className={`text-xs mt-1 ${
                  message.senderId === currentUserId ? 'text-violet-200' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;