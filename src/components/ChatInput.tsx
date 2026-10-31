import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { ImageAttachment } from '../types';
import { createSpeechRecognizer } from '../utils/audio';

interface ChatInputProps {
  onSendMessage: (text: string, images?: ImageAttachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  placeholder = 'Message Aether AI...',
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognizerRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 220)}px`;
    }
  }, [text]);

  // Focus textarea on mount and after streaming stops
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;

    onSendMessage(trimmed, images.length > 0 ? images : undefined);
    setText('');
    setImages([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        if (base64Data) {
          setImages((prev) => [
            ...prev,
            {
              name: file.name,
              mimeType: file.type,
              data: base64Data,
              size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (isFinal) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      }
    );

    if (!recognizer) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    speechRecognizerRef.current = recognizer;
    try {
      recognizer.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const canSend = text.trim().length > 0 || images.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Input container */}
      <div className="relative rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus-within:border-emerald-500/80 dark:focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-md transition-all duration-200">
        {/* Uploaded Images Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs"
              >
                <img
                  src={img.data}
                  alt={img.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">
                  {img.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? 'Listening... Speak now.' : placeholder}
          disabled={disabled}
          rows={1}
          className="w-full pt-3.5 pb-2.5 pl-4 pr-24 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-[15px] resize-none focus:outline-none min-h-[48px] max-h-[220px] leading-relaxed scrollbar-thin"
        />

        {/* Action Controls Toolbar inside the bottom of the input */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left actions: Attach image */}
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Attach image for analysis"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Dictation */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
              title={isRecording ? 'Stop recording' : 'Dictate with voice'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right action: Send or Stop */}
          <div className="flex items-center gap-2">
            {text.length > 50 && (
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                {text.length} chars
              </span>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all cursor-pointer shadow-xs"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={`p-2 rounded-full transition-all cursor-pointer shadow-xs ${
                  canSend
                    ? 'bg-violet-600 hover:bg-violet-500 text-white active:scale-95'
                    : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center mt-2 text-[11.5px] text-zinc-500 dark:text-zinc-500">
        Aether AI can make mistakes. Check important info.
      </div>
    </div>
  );
};
