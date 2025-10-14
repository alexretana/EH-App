import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FolderOpen, BookOpen, CheckSquare, BrainCircuit } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import BlackHoleIcon from '../BlackHoleIcon';

const AppSidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Projects', icon: FolderOpen, href: '/projects' },
    { name: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks' }
  ];

  const aiAgentItems = [
    { name: 'Project Planner', icon: BrainCircuit, href: '/ai/project-planner' }
  ];

  return (
    <Sidebar variant="inset" className="">
      <SidebarHeader className="glass">
        <div className="flex items-center gap-2">
          <BlackHoleIcon />
          <h1 className="text-2xl font-semibold text-gradient-primary">Event Horizon</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-glass">My Workspace</SidebarGroupLabel>
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
                            ? "glass-hover-level-1 text-primary sidebar-glass"
                            : "hover:bg-white/10 glass-hover-level-3"
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-glass">AI Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiAgentItems.map((item) => {
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
                            ? "glass-hover-level-1 text-primary sidebar-glass"
                            : "hover:bg-white/10 glass-hover-level-3"
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

      <Separator />
      
      <SidebarFooter>
        <div className="p-3">
          <p className="text-xs text-glass-muted">Event Horizon</p>
          <p className="text-xs text-glass-muted">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;