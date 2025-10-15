export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatState {
  currentView: 'history' | 'interface';
  currentConversationId: string | null;
  messages: ChatMessage[];
  conversations: ChatConversation[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  resumeUrl: string | null;
}

export type SendMessageRequest = {
  conversationId?: string;
  message: string;
  sessionId?: string;
};

export type SendMessageResponse = {
  conversationId: string;
  message: ChatMessage;
};

export type WebhookResponse = {
  direct_message_to_user: string;
  resumeUrl: string;
  sessionId: string;
};

export type ResumeChatRequest = {
  sessionId: string;
  chatInput: string;
};