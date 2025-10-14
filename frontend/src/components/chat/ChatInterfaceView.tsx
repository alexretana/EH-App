import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChatMessageFeed } from './ChatMessageFeed';
import { ChatInput } from './ChatInput';
import { ChatMessage } from '@/types/chat';

// Hot reload test - this component is now configured for hot reload!

interface ChatInterfaceViewProps {
  conversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void; // Return to history view
}

export const ChatInterfaceView = ({
  messages,
  isLoading,
  onSendMessage,
  onBack
}: ChatInterfaceViewProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* HEADER with back button */}
      <div className="glass-card p-4 mb-4 rounded-xl flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="glass-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-semibold text-glass">Chat (Hot Reload Working!)</h2>
      </div>

      {/* MESSAGE FEED - Takes remaining space */}
      <div className="flex-1 overflow-hidden mb-4">
        <ChatMessageFeed
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      {/* INPUT AREA - Fixed at bottom */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  );
};