import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, disabled, isLoading }: ChatInputProps) => {
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
};