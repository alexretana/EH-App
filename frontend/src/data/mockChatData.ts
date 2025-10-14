import { ChatConversation } from '@/types/chat';

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateDateTime = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockChatConversations: ChatConversation[] = [
  {
    id: generateId(),
    title: "Database Migration Planning",
    lastMessage: "Can you help me plan the database migration from Notion to PostgreSQL?",
    timestamp: generateDateTime(2),
    messageCount: 12,
    created_at: generateDateTime(3),
    updated_at: generateDateTime(2)
  },
  {
    id: generateId(),
    title: "Task Breakdown Discussion",
    lastMessage: "How should I break down this large feature into smaller tasks?",
    timestamp: generateDateTime(5),
    messageCount: 8,
    created_at: generateDateTime(6),
    updated_at: generateDateTime(5)
  },
  {
    id: generateId(),
    title: "Project Timeline Review",
    lastMessage: "Let's review the timeline for the next quarter",
    timestamp: generateDateTime(7),
    messageCount: 15,
    created_at: generateDateTime(8),
    updated_at: generateDateTime(7)
  },
  {
    id: generateId(),
    title: "n8n Workflow Optimization",
    lastMessage: "What are the best practices for optimizing n8n workflows?",
    timestamp: generateDateTime(10),
    messageCount: 6,
    created_at: generateDateTime(11),
    updated_at: generateDateTime(10)
  },
  {
    id: generateId(),
    title: "API Documentation Strategy",
    lastMessage: "How should we structure the new API documentation?",
    timestamp: generateDateTime(14),
    messageCount: 9,
    created_at: generateDateTime(15),
    updated_at: generateDateTime(14)
  }
];