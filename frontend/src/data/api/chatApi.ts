import {
  SendMessageRequest,
  SendMessageResponse,
  ChatMessage,
  WebhookResponse,
  ResumeChatRequest
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
 * Initialize a new chat session by calling the n8n webhook
 */
export const initializeChatSession = async (): Promise<WebhookResponse> => {
  const response = await fetch('http://n8n:5678/webhook-test/project-planner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Failed to initialize chat session: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Send a message to the resume URL to continue the chat session
 */
export const resumeChatSession = async (
  resumeUrl: string,
  request: ResumeChatRequest
): Promise<WebhookResponse> => {
  const response = await fetch(resumeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to resume chat session: ${response.statusText}`);
  }

  return response.json();
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