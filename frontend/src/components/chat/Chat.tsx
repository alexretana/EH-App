import { useState } from 'react';
import { ChatHistoryView } from './ChatHistoryView';
import { ChatInterfaceView } from './ChatInterfaceView';
import { sendMessage } from '@/data/api/chatApi';
import { mockChatConversations } from '@/data/mockChatData';
import { ChatMessage, ChatConversation } from '@/types/chat';

interface ChatProps {
  title?: string;
  apiEndpoint?: string; // Default: '/api/chat/'
  className?: string;
}

export const Chat = ({ title, apiEndpoint, className }: ChatProps) => {
  // apiEndpoint is reserved for future use with real API endpoints
  void apiEndpoint; // Explicitly mark as unused
  const [currentView, setCurrentView] = useState<'history' | 'interface'>('history');
  const [conversations, setConversations] = useState<ChatConversation[]>(mockChatConversations);
  void setConversations; // Explicitly mark as unused for now
  // setConversations is reserved for future use when updating conversation list
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const handleNewChat = () => {
    setCurrentView('interface');
    setMessages([]);
    setCurrentConversationId(null);
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to API
      const response = await sendMessage({
        conversationId: currentConversationId || undefined,
        message
      });

      // Update conversation ID if this is a new conversation
      if (!currentConversationId) {
        setCurrentConversationId(response.conversationId);
      }

      // Add agent response to messages
      setMessages(prev => [...prev, response.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return (
    <div className={`h-full ${className || ''}`}>
      {currentView === 'history' ? (
        <ChatHistoryView
          conversations={conversations}
          onNewChat={handleNewChat}
          title={title}
        />
      ) : (
        <ChatInterfaceView
          conversationId={currentConversationId}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onBack={handleBackToHistory}
        />
      )}
    </div>
  );
};