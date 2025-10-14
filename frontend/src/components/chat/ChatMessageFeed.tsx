import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Loader2 } from 'lucide-react';

interface ChatMessageFeedProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

export const ChatMessageFeed = ({ messages, isLoading }: ChatMessageFeedProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-glass-muted">Start a conversation...</p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-glass-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Agent is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};