import { motion } from 'framer-motion';
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
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`
          max-w-[80%] p-4 rounded-2xl
          ${isUser
            ? 'bg-[oklab(1_0_0_/_0.12)] border-[oklab(1_0_0_/_0.2)]'
            : 'bg-[oklab(1_0_0_/_0.08)] border-[oklab(1_0_0_/_0.15)]'
          }
          border backdrop-blur-md
        `}
      >
        <p className="text-glass whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <span className="text-xs text-glass-muted mt-2 block">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};