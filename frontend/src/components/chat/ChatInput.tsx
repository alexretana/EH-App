import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, disabled, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Auto-resize textarea within constraints
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height with constraints
      const maxHeight = isMobile ? window.innerHeight * 0.8 : window.innerHeight * 0.5;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [input, isMobile]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only send if not disabled
      if (!disabled) {
        handleSend();
      }
    }
  };

  return (
    <div
      className="glass-card p-4 rounded-xl"
      style={{
        maxHeight: isMobile ? '80vh' : '50vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
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
      
      <div className="flex gap-2" style={{ minHeight: '60px' }}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="glass-input flex-1 resize-none overflow-y-auto"
          style={{
            maxHeight: isMobile ? 'calc(80vh - 120px)' : 'calc(50vh - 120px)',
            minHeight: '60px'
          }}
          rows={1}
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
};