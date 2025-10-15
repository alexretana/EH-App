import {
  SendMessageRequest,
  SendMessageResponse,
  ChatMessage,
  WebhookResponse,
  ResumeChatRequest,
  ChatSession,
  RestoreConversationResponse
} from '@/types/chat';

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const mockSendMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  // Simulate 3-second delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const conversationId = request.conversationId || generateId();
  const agentMessage: ChatMessage = {
    id: generateId(),
    role: 'agent',
    content: "Hi, I'm the mock agent",
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  return {
    conversationId,
    message: agentMessage
  };
};

/**
 * Send a chat request to the backend API
 * Can be used to initialize a new session or resume an existing one
 */
export const sendChatRequest = async (
  sessionId?: string,
  chatInput?: string,
  resumeUrl?: string
): Promise<WebhookResponse> => {
  const requestBody: {
    sessionId?: string;
    chatInput?: string;
    resumeUrl?: string;
  } = {};
  
  // Only include these fields if they have values
  if (sessionId !== undefined) {
    requestBody.sessionId = sessionId;
  }
  if (chatInput !== undefined) {
    requestBody.chatInput = chatInput;
  }
  if (resumeUrl !== undefined) {
    requestBody.resumeUrl = resumeUrl;
  }

  const response = await fetch('/api/chat/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to send chat request: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Initialize a new chat session by calling the backend API
 * @deprecated Use sendChatRequest() instead
 */
export const initializeChatSession = async (): Promise<WebhookResponse> => {
  return sendChatRequest();
};

/**
 * Send a message to continue the chat session via backend
 * @deprecated Use sendChatRequest() instead
 */
export const resumeChatSession = async (
  resumeUrl: string,
  request: ResumeChatRequest
): Promise<WebhookResponse> => {
  return sendChatRequest(request.sessionId, request.chatInput, resumeUrl);
};

/**
 * Convert webhook response to chat message format
 */
export const webhookResponseToChatMessage = (
  response: WebhookResponse
): ChatMessage => {
  return {
    id: generateId(),
    role: 'agent',
    content: response.direct_message_to_user,
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
};

export const sendMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  // Use mock for now
  return mockSendMessage(request);
  
  // Real implementation (for later):
  // const response = await fetch('/api/chat/', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request)
  // });
  // return response.json();
};

/**
 * Get all chat sessions with their descriptions and metadata
 */
export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await fetch('/api/chat/sessions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chat sessions: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Restore a conversation by fetching all messages for a session
 */
export const restoreConversation = async (
  sessionId: string
): Promise<RestoreConversationResponse> => {
  const response = await fetch('/api/chat/restore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to restore conversation: ${response.statusText}`);
  }

  return response.json();
};