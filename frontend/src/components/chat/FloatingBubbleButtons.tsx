import { ArrowLeft, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface FloatingBubbleButtonsProps {
  onBack: () => void;
  onScrollToBottom: () => void;
}

export const FloatingBubbleButtons = ({
  onBack,
  onScrollToBottom
}: FloatingBubbleButtonsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Add a small delay before showing buttons for a smoother entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
    }`}>
      {/* Back to history button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="glass-button rounded-full w-12 h-12 flex items-center justify-center shadow-lg mr-3"
        style={{ background: 'oklab(1 0 0 / 0.05)', backdropFilter: 'blur(12px)' }}
        aria-label="Back to chat history"
      >
        <ArrowLeft className="h-5 w-5 text-glass" />
      </Button>

      {/* Scroll to bottom button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onScrollToBottom}
        className="glass-button rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        style={{ background: 'oklab(1 0 0 / 0.05)', backdropFilter: 'blur(12px)' }}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-5 w-5 text-glass" />
      </Button>
    </div>
  );
};