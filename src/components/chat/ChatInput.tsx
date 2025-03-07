import React, { useState, useRef } from 'react';
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  CameraIcon,
  PaperClipIcon,
} from '@heroicons/react/24/solid';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (!isTyping && e.target.value) {
      setIsTyping(true);
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onSendMessage(message, Array.from(e.target.files));
      setMessage('');
      setShowMediaOptions(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
      setShowMediaOptions(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            onSendMessage('', [file]);
          }
        }, 'image/jpeg');
      }
      stopCamera();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-3">
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg mb-4"
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Take Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full rounded-full border-2 border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 py-2.5 px-4 pr-24 resize-none transition-all bg-white shadow-sm"
              style={{ minHeight: '45px', maxHeight: '150px' }}
              rows={1}
              disabled={disabled}
            />
            <div className="absolute right-3 bottom-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMediaOptions(!showMediaOptions)}
                className="p-2 text-violet-400 hover:text-violet-600 transition-colors transform hover:scale-110"
              >
                <PaperClipIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            {onStartRecording && onStopRecording && (
              <button
                type="button"
                onClick={isRecording ? onStopRecording : onStartRecording}
                className={`p-2.5 rounded-full transition-all transform hover:scale-110 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg'
                    : 'bg-violet-100 hover:bg-violet-200 text-violet-600 hover:text-violet-700'
                }`}
                disabled={disabled}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className="p-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              disabled={disabled || !message.trim()}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showMediaOptions && (
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-xl border border-violet-100 p-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all duration-200"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="p-2.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all duration-200"
            >
              <CameraIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*"
          multiple
        />
      </form>
    </div>
  );
};

export default ChatInput;