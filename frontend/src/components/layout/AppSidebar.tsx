import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FolderOpen, BookOpen, CheckSquare } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const AppSidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Projects', icon: FolderOpen, href: '/projects' },
    { name: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks' }
  ];

  return (
    <Sidebar variant="inset" className="sidebar-glass">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
          <h1 className="text-xl font-semibold">Event Horizon</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-white/10"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-3 rounded-lg border border-white/10">
          <p className="text-xs text-muted-foreground">Event Horizon</p>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;