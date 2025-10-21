import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  // Configure marked with GFM support
  useEffect(() => {
    marked.use({
      gfm: true,
      breaks: false,
      pedantic: false
    });
  }, []);

  const isUser = message.role === 'user';

  return (
    <motion.div
      className={isUser ? "flex justify-start" : "w-full"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isUser ? (
        <div>
          <div
            className="
              max-w-[80%] p-4 rounded-2xl
              bg-[oklab(1_0_0_/_0.12)] border-[oklab(1_0_0_/_0.2)]
              border backdrop-blur-md
            "
          >
            <p className="text-glass whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <span className="text-xs text-glass-muted mt-1 block ml-4">
            {formatTime(message.timestamp)}
          </span>
        </div>
      ) : (
        <div className="w-full px-4 py-3">
          <div className="w-full max-w-none">
            <div
              className="prose prose-invert max-w-none text-ai-glow"
              dangerouslySetInnerHTML={{
                __html: marked.parse(message.content)
              }}
            />
            <span className="text-xs text-glass-muted mt-2 block">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};