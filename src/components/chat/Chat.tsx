import React, { useState, useCallback, useRef } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import { MessageProps } from './Message';
import { playMessageSentSound, playMessageReceivedSound } from '../../utils/sounds';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: MessageProps[];
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      title: 'Previous Chat 1',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      messages: [],
    },
    {
      id: '2',
      title: 'Previous Chat 2',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      messages: [],
    },
  ]);
  const [activeChat, setActiveChat] = useState('current');

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    const userMessage: MessageProps = {
      content,
      isUser: true,
      timestamp: new Date(),
    };

    if (attachments?.length) {
      userMessage.attachments = await Promise.all(
        attachments.map(async (file) => ({
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: URL.createObjectURL(file),
        }))
      );
    }

    setMessages((prev) => [...prev, userMessage]);
    playMessageSentSound();

    setIsTyping(true);
    setTimeout(() => {
      const aiMessage: MessageProps = {
        content: 'This is a simulated AI response. Backend integration pending.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      playMessageReceivedSound();
    }, 1000);
  };

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsVoiceActive(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsVoiceActive(false);
  }, []);

  const handleClose = useCallback(() => {
    console.log('Chat closed');
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChat(id);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
        history={chatHistory}
        onSelectChat={handleSelectChat}
        activeChat={activeChat}
      />
      <div className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onClose={handleClose}
          onStartVoice={handleStartRecording}
          isVoiceActive={isVoiceActive}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          isRecording={isVoiceActive}
        />
      </div>
    </div>
  );
};

export default Chat;