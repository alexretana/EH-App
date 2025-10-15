import { useState, useEffect } from 'react';
import { ChatHistoryView } from './ChatHistoryView';
import { ChatInterfaceView } from './ChatInterfaceView';
import {
  sendChatRequest,
  webhookResponseToChatMessage,
  getChatSessions,
  restoreConversation
} from '@/data/api/chatApi';
import { mockChatConversations } from '@/data/mockChatData';
import { ChatMessage, ChatConversation, ChatSession } from '@/types/chat';

interface ChatProps {
  title?: string;
  apiEndpoint?: string; // Default: '/api/chat/'
  className?: string;
}

export const Chat = ({ title, apiEndpoint, className }: ChatProps) => {
  // apiEndpoint is reserved for future use with real API endpoints
  void apiEndpoint; // Explicitly mark as unused
  const [currentView, setCurrentView] = useState<'history' | 'interface'>('history');
  const [conversations] = useState<ChatConversation[]>(mockChatConversations);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Load chat sessions on component mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const chatSessions = await getChatSessions();
        setSessions(chatSessions);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        // Continue with mock data if API fails
      }
    };
    
    loadSessions();
  }, []);

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

  const handleSelectConversation = async (sessionId: string) => {
    setCurrentView('interface');
    setMessages([]);
    setCurrentConversationId(sessionId);
    setSessionId(sessionId);
    setResumeUrl(null);
    setIsRestoring(true);

    try {
      // Restore the conversation history
      const restoredData = await restoreConversation(sessionId);
      
      // Set the restored messages
      setMessages(restoredData.messages);
      
      // Don't initialize the chat session yet - wait for user to send a message
      // This prevents the 500 error since we don't have a resumeUrl yet
      // The chat will be initialized when the user sends their first message
    } catch (error) {
      console.error('Error restoring conversation:', error);
      // TODO: Handle error state - maybe show error message to user
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
    setSessionId(null);
    setResumeUrl(null);
  };

  const handleSendMessage = async (message: string) => {
    // If we have a sessionId but no resumeUrl, we need to initialize the chat first
    if (sessionId && !resumeUrl) {
      setIsLoading(true);
      try {
        // Initialize chat session with n8n to prepare for continuation
        const webhookResponse = await sendChatRequest(sessionId);
        
        // Set session data
        setResumeUrl(webhookResponse.resumeUrl);
        
        // Now send the message
        await sendMessageWithResume(message, webhookResponse.resumeUrl);
      } catch (error) {
        console.error('Error initializing chat session:', error);
        setIsLoading(false);
        return;
      }
    } else if (sessionId && resumeUrl) {
      // Normal flow - send message with existing resumeUrl
      await sendMessageWithResume(message, resumeUrl);
    } else {
      console.error('No active session');
      return;
    }
  };

  const sendMessageWithResume = async (message: string, currentResumeUrl: string) => {
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
      const webhookResponse = await sendChatRequest(sessionId!, message, currentResumeUrl);

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
          conversations={sessions.length === 0 ? conversations : undefined}
          sessions={sessions.length > 0 ? sessions : undefined}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          title={title}
        />
      ) : (
        <ChatInterfaceView
          conversationId={currentConversationId}
          messages={messages}
          isLoading={isLoading || isRestoring}
          onSendMessage={handleSendMessage}
          onBack={handleBackToHistory}
        />
      )}
    </div>
  );
};