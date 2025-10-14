# Chat Interface Implementation Plan

## Overview
This document outlines the implementation plan for a reusable chat interface that will be used in the Project Planner Chat Page and potentially two other views. The interface maintains the glassmorphic design aesthetic and integrates with the existing codebase structure.

**IMPORTANT DESIGN NOTE:** This chat interface uses a **full-page view switcher** design. There is NO sidebar. The conversation history is displayed as a full-page view with glass cards (similar to ProjectView), and clicking "Start New Chat" switches to a full-page chat interface.

## Requirements Analysis

### Core Features
1. **Chat History View (Full Page)**
   - Display previous conversations as glass cards (similar to ProjectView cards, non-expandable)
   - "Start New Chat" button card at the TOP of the list
   - Grid/list layout of conversation history cards
   - Hover effects on conversation cards (glass-hover-level-2)
   - Cards NOT clickable to load conversation in MVP (only hover effects)

2. **Chat Interface View (Full Page)**
   - Replaces chat history view when "Start New Chat" is clicked
   - **Back button in top-left** to return to chat history
   - Displays user and agent messages in distinct chat bubbles
   - Different shades for user vs agent bubbles
   - Message feed with scroll functionality
   - Fixed input area at bottom

3. **Input Area**
   - Text area for user input
   - Disabled during API calls
   - Loading indicator above text area during agent response
   - Send message on submit

4. **Backend Integration**
   - API endpoint: `/api/chat/`
   - Mock response: "Hi, I'm the mock agent" after 3 seconds
   - Vite proxy configured for frontend `/api` to backend

## Architecture Design

### Component Structure

```
frontend/src/
├── components/
│   └── chat/
│       ├── Chat.tsx                      # Main container (manages view state)
│       ├── ChatHistoryView.tsx           # Full-page conversation history
│       ├── ChatHistoryCard.tsx           # Individual conversation card
│       ├── ChatInterfaceView.tsx         # Full-page chat interface
│       ├── ChatMessageFeed.tsx           # Scrollable message display
│       ├── ChatMessage.tsx               # Individual message bubble
│       └── ChatInput.tsx                 # Input area with loading state
├── types/
│   └── chat.ts                           # Chat-specific types
├── data/
│   ├── mockChatData.ts                   # Mock conversation data
│   └── api/
│       └── chatApi.ts                    # Chat API functions (mock + real)
└── views/
    └── ProjectPlannerView.tsx            # Uses Chat component
```

### Type Definitions

```typescript
// frontend/src/types/chat.ts

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
}

export type SendMessageRequest = {
  conversationId?: string;
  message: string;
};

export type SendMessageResponse = {
  conversationId: string;
  message: ChatMessage;
};
```

### Component Details

#### 1. Chat.tsx (Main Container)
**Purpose:** Top-level component that manages view state (history vs interface) and chat state

**Props:**
```typescript
interface ChatProps {
  title?: string;
  apiEndpoint?: string; // Default: '/api/chat/'
  className?: string;
}
```

**View State:**
- `'history'` - Shows chat history view (default)
- `'interface'` - Shows active chat interface

**State Management:**
- Current view: 'history' | 'interface'
- Current conversation ID
- Message history for active conversation
- Loading state
- Conversation list

**Layout:**
Single full-page view that switches between:
1. ChatHistoryView (default)
2. ChatInterfaceView (when chatting)

**Implementation:**
```tsx
const [currentView, setCurrentView] = useState<'history' | 'interface'>('history');
const [conversations, setConversations] = useState<ChatConversation[]>([]);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

return (
  <div className="h-full">
    {currentView === 'history' ? (
      <ChatHistoryView
        conversations={conversations}
        onNewChat={handleNewChat}
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
```

#### 2. ChatHistoryView.tsx
**Purpose:** Full-page view displaying conversation history as cards

**Props:**
```typescript
interface ChatHistoryViewProps {
  conversations: ChatConversation[];
  onNewChat: () => void;
  onSelectConversation?: (id: string) => void; // Optional for MVP
  title?: string;
}
```

**Features:**
- "Start New Chat" button card at the TOP of the list
- List layout of conversation cards
- Scrollable area for cards
- Hover effects on all cards (glass-hover-level-2)
- Cards NOT clickable for MVP (only hover effects, cursor-default)

**Layout Example:**
```tsx
<div className="space-y-6">
  <h1 className="text-3xl font-bold text-glass">
    {title || 'Project Planner'}
  </h1>
  
  <div className="space-y-4">
    {/* START NEW CHAT CARD - Always first */}
    <motion.div
      className="glass-card p-6 rounded-xl glass-hover-level-1 cursor-pointer flex items-center justify-center gap-3"
      onClick={onNewChat}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Plus className="h-5 w-5" />
      <span className="text-lg font-semibold text-glass">Start New Chat</span>
    </motion.div>

    {/* CONVERSATION HISTORY CARDS */}
    {conversations.length === 0 ? (
      <div className="glass-card p-8 rounded-xl text-center">
        <p className="text-glass-muted">No previous conversations</p>
      </div>
    ) : (
      conversations.map(conversation => (
        <ChatHistoryCard
          key={conversation.id}
          conversation={conversation}
          onSelect={onSelectConversation} // null for MVP
        />
      ))
    )}
  </div>
</div>
```

**Styling:**
- Similar to ProjectView layout
- glass-card for all cards
- glass-hover-level-1 for "Start New Chat" button
- glass-hover-level-2 for conversation cards
- space-y-4 for card spacing

#### 3. ChatHistoryCard.tsx
**Purpose:** Display individual conversation preview card

**Props:**
```typescript
interface ChatHistoryCardProps {
  conversation: ChatConversation;
  onSelect?: (id: string) => void; // Optional for MVP
}
```

**Layout:**
- Title/summary of conversation (from AI)
- Last message preview (truncated, 2 lines max)
- Timestamp (relative: "2 hours ago")
- Message count badge (optional)

**Implementation:**
```tsx
<motion.div
  className="glass-card p-6 rounded-xl glass-hover-level-2 cursor-default"
  layout
  whileHover={{ scale: 1.005 }}
>
  <div className="flex flex-col gap-2">
    <h3 className="text-lg font-semibold text-glass line-clamp-1">
      {conversation.title}
    </h3>
    <p className="text-sm text-glass-muted line-clamp-2">
      {conversation.lastMessage}
    </p>
    <div className="flex items-center justify-between mt-2">
      <span className="text-xs text-glass-muted">
        {formatRelativeTime(conversation.timestamp)}
      </span>
      {conversation.messageCount && (
        <Badge variant="outline" className="glass-button text-xs">
          {conversation.messageCount} messages
        </Badge>
      )}
    </div>
  </div>
</motion.div>
```

**Styling:**
- glass-card base
- glass-hover-level-2 on hover
- cursor-default for MVP (not clickable yet)
- Similar height/padding to project cards
- line-clamp-1 for title, line-clamp-2 for preview

#### 4. ChatInterfaceView.tsx
**Purpose:** Full-page chat interface with back button

**Props:**
```typescript
interface ChatInterfaceViewProps {
  conversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void; // Return to history view
}
```

**Layout:**
```tsx
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
    <h2 className="text-xl font-semibold text-glass">Chat</h2>
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
```

**Styling:**
- Full height container (flex flex-col h-full)
- glass-card for header
- Fixed positioning for header and input
- flex-1 for message feed

#### 5. ChatMessageFeed.tsx
**Purpose:** Scrollable area displaying all messages

**Props:**
```typescript
interface ChatMessageFeedProps {
  messages: ChatMessage[];
  isLoading: boolean;
}
```

**Features:**
- Auto-scroll to bottom on new messages
- Empty state when no messages
- Loading indicator for agent response (at bottom)
- Uses ScrollArea component

**Implementation:**
```tsx
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
          <Spinner className="h-4 w-4" />
          <span>Agent is typing...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  </ScrollArea>
);
```

**Styling:**
- ScrollArea with full height
- space-y-4 for message spacing
- Padding for comfortable reading

#### 6. ChatMessage.tsx
**Purpose:** Individual message bubble

**Props:**
```typescript
interface ChatMessageProps {
  message: ChatMessage;
}
```

**Layout:**
- User messages: right-aligned
- Agent messages: left-aligned
- Message content
- Timestamp (small text)

**Implementation:**
```tsx
const isUser = message.role === 'user';

return (
  <motion.div
    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div
      className={`
        max-w-[80%] p-4 rounded-2xl
        ${isUser
          ? 'bg-[oklab(1_0_0_/_0.12)] border-[oklab(1_0_0_/_0.2)]'
          : 'bg-[oklab(1_0_0_/_0.08)] border-[oklab(1_0_0_/_0.15)]'
        }
        border backdrop-blur-md
      `}
    >
      <p className="text-glass whitespace-pre-wrap break-words">
        {message.content}
      </p>
      <span className="text-xs text-glass-muted mt-2 block">
        {formatTime(message.timestamp)}
      </span>
    </div>
  </motion.div>
);
```

**Styling:**
User message:
- Background: `oklab(1 0 0 / 0.12)`
- Border: `oklab(1 0 0 / 0.2)`
- Right-aligned

Agent message:
- Background: `oklab(1 0 0 / 0.08)`
- Border: `oklab(1 0 0 / 0.15)`
- Left-aligned

Both:
- backdrop-blur-md
- rounded-2xl
- padding: p-4
- max-width: max-w-[80%]

#### 7. ChatInput.tsx
**Purpose:** Text input area with send button

**Props:**
```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isLoading: boolean;
}
```

**Features:**
- Textarea component (glass-input styling)
- Send button (disabled when empty or loading)
- Loading indicator ABOVE input when isLoading
- Enter to send (Shift+Enter for new line)
- Clear input after send

**Implementation:**
```tsx
const [input, setInput] = useState('');

const handleSend = () => {
  if (input.trim() && !disabled) {
    onSend(input.trim());
    setInput('');
  }
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

return (
  <div className="glass-card p-4 rounded-xl">
    {/* Loading indicator */}
    {isLoading && (
      <div className="h-0.5 w-full bg-primary/30 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-primary"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )}
    
    <div className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        className="glass-input flex-1 resize-none"
        rows={3}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="glass-button"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
```

**Loading Indicator:**
- Thin animated line (h-0.5)
- Primary color with opacity
- Position: above textarea
- Animation: sliding gradient effect

**Styling:**
- glass-card container
- glass-input for textarea
- glass-button for send button
- Disabled state: opacity-50, cursor-not-allowed

## API Integration

### Mock API Function
```typescript
// frontend/src/data/api/chatApi.ts

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
```

### Mock Data
```typescript
// frontend/src/data/mockChatData.ts

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
```

## Glassmorphic Design Application

### Color Scheme
Based on globals.css variables:
- User message background: `oklab(1 0 0 / 0.12)`
- Agent message background: `oklab(1 0 0 / 0.08)`
- Card background: `oklab(1 0 0 / 0.08)`
- Borders: `oklab(1 0 0 / 0.15)` to `oklab(1 0 0 / 0.2)`

### Utility Classes to Use
- `.glass-card` - Base card styling
- `.glass-hover-level-1` - For "Start New Chat" button
- `.glass-hover-level-2` - For conversation history cards
- `.glass-input` - Input field styling
- `.glass-button` - Button styling
- `.text-glass` - Primary text color
- `.text-glass-muted` - Secondary text color

### Animations
Use Framer Motion for:
- View transitions (history ↔ interface)
- Message entrance (fade + slide from bottom)
- Loading indicator animation
- Card hover effects

```typescript
// Message animation
const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// View transition
const viewVariants = {
  exit: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0 }
};
```

## Implementation Flow

### Phase 1: Type Definitions and Mock Data
1. Create `frontend/src/types/chat.ts`
2. Create `frontend/src/data/mockChatData.ts`
3. Create `frontend/src/data/api/chatApi.ts`

### Phase 2: Core Components
1. Create `ChatMessage.tsx` (simplest component)
2. Create `ChatInput.tsx`
3. Create `ChatMessageFeed.tsx`
4. Create `ChatInterfaceView.tsx`

### Phase 3: History View Components
1. Create `ChatHistoryCard.tsx`
2. Create `ChatHistoryView.tsx`

### Phase 4: Main Container
1. Create `Chat.tsx` (integrates all components, manages view state)
2. Implement state management and view switching
3. Wire up API calls

### Phase 5: View Integration
1. Update `ProjectPlannerView.tsx` to use Chat component
2. Test view switching
3. Test all interactions
4. Verify glassmorphic styling consistency

## State Management Flow

```
Initial load
  ↓
Show ChatHistoryView (default view)
  ↓
User clicks "Start New Chat"
  ↓
Switch to ChatInterfaceView
Set conversationId = null (new conversation)
  ↓
User types message and sends
  ↓
Add user message to messages array
  ↓
Set isLoading = true
  ↓
Call API: sendMessage({ conversationId, message })
  ↓
Wait 3 seconds (mock delay)
  ↓
Receive agent response (with conversationId)
  ↓
Update conversationId if new
Add agent message to messages array
  ↓
Set isLoading = false
  ↓
User can send next message or click Back
  ↓
Back button clicked
  ↓
Switch to ChatHistoryView
```

## Responsive Design

### All Screen Sizes
- Single full-page view (NO SIDEBAR)
- History view: list of cards
- Chat interface: full-width message area

### Desktop (≥1024px)
- History cards: single column, max-width constrained
- Chat messages: max-w-[80%]
- Generous padding and spacing

### Tablet (768px - 1023px)
- History cards: single column, full width
- Chat messages: max-w-[85%]
- Medium padding

### Mobile (<768px)
- History cards: full width, reduced padding
- Chat messages: max-w-[90%]
- Compact spacing
- Smaller text in cards
- Reduced input area size

## Testing Checklist

### Functionality
- [ ] Chat history view displays on initial load
- [ ] Start new chat button opens chat interface
- [ ] Back button returns to history view
- [ ] User can type and send messages
- [ ] Messages appear in correct order
- [ ] Agent responds after 3-second delay
- [ ] Input disabled during loading
- [ ] Loading indicator shows/hides correctly
- [ ] Scroll to bottom on new messages
- [ ] Conversation cards show in history view
- [ ] Hover effects work on all cards

### Styling
- [ ] Glassmorphic effects applied consistently
- [ ] History cards styled like project cards
- [ ] User/agent messages have different shades
- [ ] All text is readable
- [ ] Hover effects work smoothly on all cards
- [ ] Back button clearly visible and functional
- [ ] Loading indicator visible and animated
- [ ] Full-page views work on all screen sizes
- [ ] Animations smooth and performant

### Edge Cases
- [ ] Empty conversation history (first time user)
- [ ] No messages in new conversation
- [ ] Very long messages (wrapping)
- [ ] Many messages (scrolling performance)
- [ ] Fast message sending (queue handling)
- [ ] Back button during loading
- [ ] Network error handling (future)

## Future Enhancements (Not in MVP)

1. **Clickable Conversations**
   - Load conversation history
   - Switch between conversations
   - Maintain message history per conversation

2. **Message Features**
   - Markdown rendering
   - Code block syntax highlighting
   - Copy message content
   - Regenerate response

3. **Conversation Management**
   - Delete conversations
   - Rename conversations
   - Search conversations
   - Export conversation

4. **Real-time Features**
   - WebSocket connection
   - Typing indicators
   - Read receipts

5. **Advanced UI**
   - Message reactions
   - File attachments
   - Voice input
   - Conversation folders/tags

## Reusability Strategy

The Chat component is designed to be reusable for other views by:

1. **Prop-based Configuration**
   - Custom API endpoint
   - Custom title for history view
   - Custom styling classes

2. **Full-Page Design**
   - No sidebar constraints
   - Works independently in any route
   - Simple view switching logic

3. **Component Composition**
   - Individual components can be used separately
   - Easy to override styling
   - ChatHistoryView can be customized per use case

4. **State Management**
   - Self-contained state within Chat component
   - Can integrate with global state if needed
   - Easy to add context provider later

### Example Usage in Other Views

```typescript
// Goal Planner Chat
<Chat
  title="Goal Planning Assistant"
  apiEndpoint="/api/chat/goal-planner/"
  className="custom-goal-chat"
/>

// Task Breakdown Chat
<Chat
  title="Task Assistant"
  apiEndpoint="/api/chat/task-assistant/"
/>

// Project Planner Chat (current)
<Chat
  title="Project Planner"
  apiEndpoint="/api/chat/"
/>
```

**Note:** Each instance gets its own full-page view with history cards and chat interface. No sidebars to manage!

## Accessibility Considerations

1. **Keyboard Navigation**
   - Tab through interactive elements
   - Enter to send message
   - Esc to go back (optional)

2. **Screen Readers**
   - ARIA labels on buttons
   - Role attributes on chat regions
   - Alt text for loading indicators

3. **Visual**
   - Sufficient color contrast
   - Focus indicators
   - Clear visual hierarchy

4. **Semantic HTML**
   - Proper heading levels
   - List structures for messages
   - Button vs div for clickable elements

## Performance Considerations

1. **Message Rendering**
   - Virtualize long message lists (future)
   - Memoize message components
   - Optimize re-renders with React.memo

2. **State Updates**
   - Batch message additions
   - Debounce input changes (if needed)
   - Lazy load conversation history

3. **Animations**
   - Use transform/opacity for animations
   - Leverage GPU acceleration
   - Reduce motion for accessibility

## Summary

This implementation plan provides a comprehensive roadmap for building a reusable, glassmorphic chat interface for the Project Planner Chat Page. The design uses a **full-page view switcher** (NO SIDEBAR) with glassmorphic cards for conversation history, maintaining consistency with the existing ProjectView design.

Key deliverables:
1. Reusable Chat component system with view switching
2. Full-page chat history view with glass cards
3. Full-page chat interface with back button
4. Mock API integration with 3-second delay
5. Glassmorphic design matching ProjectView aesthetic
6. Responsive, accessible interface

The implementation follows React best practices, integrates with existing shadcn/ui components, and maintains the established glassmorphic aesthetic throughout.

**CRITICAL DESIGN PRINCIPLE:** The conversation history is NOT a sidebar. It's a full-page view that displays cards in a list, similar to the ProjectView. The user switches between the history view and the chat interface view using the "Start New Chat" button and back button.