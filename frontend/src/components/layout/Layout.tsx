import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SidebarProvider, SidebarInset, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';

const Layout: React.FC = () => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.4
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="glass-drawer h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="glass-button text-glass hover:text-glass" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
              <h1 className="text-xl font-semibold text-glass">Event Horizon</h1>
            </div>
          </div>
        </header>
        
        <main className="transition-all duration-300 ease-in-out">
          <div className="container mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        
        <SidebarRail />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;