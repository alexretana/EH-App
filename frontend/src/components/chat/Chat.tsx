import { useState } from 'react';
import { ChatHistoryView } from './ChatHistoryView';
import { ChatInterfaceView } from './ChatInterfaceView';
import {
  sendChatRequest,
  webhookResponseToChatMessage
} from '@/data/api/chatApi';
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const handleNewChat = async () => {
    setCurrentView('interface');
    setMessages([]);
    setCurrentConversationId(null);
    setSessionId(null);
    setResumeUrl(null);
    setIsLoading(true);

    try {
      // Initialize chat session with n8n webhook
      const webhookResponse = await sendChatRequest();
      
      // Set session data
      setSessionId(webhookResponse.sessionId);
      setResumeUrl(webhookResponse.resumeUrl);
      
      // Convert webhook response to chat message and add to messages
      const agentMessage = webhookResponseToChatMessage(webhookResponse);
      setMessages([agentMessage]);
      
      // Set a new conversation ID
      setCurrentConversationId(generateId());
    } catch (error) {
      console.error('Error initializing chat session:', error);
      // TODO: Handle error state - maybe show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
    setSessionId(null);
    setResumeUrl(null);
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId || !resumeUrl) {
      console.error('No active session');
      return;
    }

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
      // Send message using the unified chat endpoint
      const webhookResponse = await sendChatRequest(sessionId, message, resumeUrl);

      // Update session data in case it changed
      setSessionId(webhookResponse.sessionId);
      setResumeUrl(webhookResponse.resumeUrl);

      // Convert webhook response to chat message and add to messages
      const agentMessage = webhookResponseToChatMessage(webhookResponse);
      setMessages(prev => [...prev, agentMessage]);
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