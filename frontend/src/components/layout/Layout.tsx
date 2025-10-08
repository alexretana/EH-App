import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Aurora from '../Aurora';
import BlackHoleIcon from '../BlackHoleIcon';

const Layout: React.FC = () => {

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#1a1220", "#372544", "#0f0714"]}
          blend={0.8}
          amplitude={1.0}
          speed={0.2}
        />
      </div>
      
      {/* App Content */}
      <div className="relative z-10 w-full h-full bg-transparent">
        <SidebarProvider className="has-data-[variant=inset]:bg-transparent">
          <AppSidebar />
          <SidebarInset className="bg-transparent">
            <header className="glass-drawer h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="glass-button text-glass hover:text-glass" />
                
                <div className="flex items-center gap-2">
                  <BlackHoleIcon />
                  <h1 className="text-xl font-semibold text-glass">Event Horizon</h1>
                </div>
              </div>
            </header>
            
            <main className="h-[calc(100vh-4rem)] overflow-y-auto bg-transparent">
              <div className="container mx-auto px-4 py-6">
                <Outlet />
              </div>
            </main>
            
            <SidebarRail />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Layout;