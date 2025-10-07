import type { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { Menu, X, FolderOpen, BookOpen, CheckSquare } from 'lucide-solid';

interface LayoutProps {
  children?: any;
}

export const Layout: Component<LayoutProps> = (props) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = createSignal(false);

  const navItems = [
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <div class="min-h-screen bg-bg text-text flex">
      {/* Sidebar/Drawer */}
      <div
        class={`fixed lg:relative top-0 left-0 h-full bg-bg-dark border-r border-border transform transition-all duration-300 ease-in-out z-40 flex-shrink-0 ${
          isDrawerExpanded() ? 'w-64' : 'w-16'
        }`}
      >
        <div class="p-4">
          <div class="flex items-center justify-center mb-8">
            <h1 class={`text-2xl font-bold text-primary transition-opacity duration-300 ${
              isDrawerExpanded() ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            }`}>
              Event Horizon
            </h1>
            <button
              onClick={() => setIsDrawerExpanded(!isDrawerExpanded())}
              class="p-2 hover:bg-highlight rounded transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
          
          <nav class="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <A
                  href={item.path}
                  class="flex items-center px-3 py-3 rounded-lg transition-colors hover:bg-bg-light text-text hover:text-primary"
                  title={isDrawerExpanded() ? '' : item.label}
                >
                  <Icon size={20} />
                  <span class={`ml-3 transition-opacity duration-300 ${
                    isDrawerExpanded() ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    {item.label}
                  </span>
                </A>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div class="flex-1 min-w-0">
        <main class="p-6 lg:p-8">
          {props.children}
        </main>
      </div>
    </div>
  );
};