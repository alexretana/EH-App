import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChatConversation } from '@/types/chat';

interface ChatHistoryCardProps {
  conversation: ChatConversation;
  onSelect?: (id: string) => void; // Optional for MVP
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

export const ChatHistoryCard = ({ conversation, onSelect }: ChatHistoryCardProps) => {
  // onSelect is intentionally unused for MVP - cards are not clickable yet
  void onSelect; // Explicitly mark as unused
  return (
    <motion.div
      className="glass-card p-6 rounded-xl glass-hover-level-2 cursor-default"
      layout
      whileHover={{ scale: 1.005 }}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-glass line-clamp-1">
          {conversation.title}
        </h3>
        <p className="text-sm text-glass-muted line-clamp-2">
          {conversation.lastMessage}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-glass-muted">
            {formatRelativeTime(conversation.timestamp)}
          </span>
          {conversation.messageCount && (
            <Badge variant="outline" className="glass-button text-xs">
              {conversation.messageCount} messages
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};