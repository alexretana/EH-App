import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ChatHistoryCard } from './ChatHistoryCard';
import { ChatConversation } from '@/types/chat';

interface ChatHistoryViewProps {
  conversations: ChatConversation[];
  onNewChat: () => void;
  onSelectConversation?: (id: string) => void; // Optional for MVP
  title?: string;
}

export const ChatHistoryView = ({
  conversations,
  onNewChat,
  onSelectConversation,
  title
}: ChatHistoryViewProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-glass">
        {title || 'Project Planner'}
      </h1>
      
      <div className="space-y-4">
        {/* START NEW CHAT CARD - Always first */}
        <motion.div
          className="glass-card p-6 rounded-xl glass-hover-level-1 cursor-pointer flex items-center justify-center gap-3"
          onClick={onNewChat}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-lg font-semibold text-glass">Start New Chat</span>
        </motion.div>

        {/* CONVERSATION HISTORY CARDS */}
        {conversations.length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center">
            <p className="text-glass-muted">No previous conversations</p>
          </div>
        ) : (
          conversations.map(conversation => (
            <ChatHistoryCard
              key={conversation.id}
              conversation={conversation}
              onSelect={onSelectConversation} // null for MVP
            />
          ))
        )}
      </div>
    </div>
  );
};