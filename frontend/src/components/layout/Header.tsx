import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlackHoleIcon from '../BlackHoleIcon';

interface HeaderProps {
  toggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleDrawer }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-drawer h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDrawer}
          className="glass-button text-glass hover:text-glass md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <BlackHoleIcon />
          <h1 className="text-4xl font-semibold text-gradient-primary">Event Horizon</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDrawer}
          className="glass-button text-glass hover:text-glass hidden md:flex"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;