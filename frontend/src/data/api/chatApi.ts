import { SendMessageRequest, SendMessageResponse, ChatMessage } from '@/types/chat';

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