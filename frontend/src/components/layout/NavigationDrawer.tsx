import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, BookOpen, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationDrawerProps {
  isOpen: boolean;
  toggleDrawer: () => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, toggleDrawer }) => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Projects', icon: FolderOpen, href: '/projects' },
    { name: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks' }
  ];

  const navItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const containerVariants = {
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDrawer}
          />
        )}
      </AnimatePresence>
      
      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 z-50 h-full w-64 md:w-72 glass-drawer"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-glass">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDrawer}
                className="glass-button text-glass hover:text-glass"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <motion.nav
              className="p-4"
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
            >
              <ul className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <motion.li
                      key={item.name}
                      variants={navItemVariants}
                      custom={index}
                    >
                      <NavLink
                        to={item.href}
                        onClick={toggleDrawer}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "text-glass hover:bg-white/10 hover:text-glass"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </NavLink>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-glass-muted">Event Horizon</p>
                <p className="text-xs text-glass-muted">v1.0.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationDrawer;