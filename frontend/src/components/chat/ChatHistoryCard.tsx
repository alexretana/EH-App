import { motion } from 'framer-motion';
import { ChatConversation, ChatSession } from '@/types/chat';

interface ChatHistoryCardProps {
  conversation?: ChatConversation;
  session?: ChatSession;
  onSelect?: (id: string) => void;
}

const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const ChatHistoryCard = ({ conversation, session, onSelect }: ChatHistoryCardProps) => {
  // Use session if provided, otherwise fall back to conversation
  const title = session?.description || conversation?.title || "Untitled Conversation";
  const timestamp = session?.timestamp || conversation?.timestamp || "";
  const id = session?.sessionId || conversation?.id || "";
  
  const handleClick = () => {
    if (onSelect && id) {
      onSelect(id);
    }
  };
  
  return (
    <motion.div
      className="glass-card p-6 rounded-xl glass-hover-level-2 cursor-pointer"
      layout
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={handleClick}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-glass line-clamp-1">
          {title}
        </h3>
        <span className="text-xs text-glass-muted">
          {formatRelativeTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
};