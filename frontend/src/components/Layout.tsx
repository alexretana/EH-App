import type { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { Menu, X, FolderOpen, BookOpen, CheckSquare } from 'lucide-solid';

interface LayoutProps {
  children?: any;
}

export const Layout: Component<LayoutProps> = (props) => {
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen());

  const navItems = [
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <div class="min-h-screen bg-bg text-text">
      {/* Mobile menu button */}
      <div class="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleDrawer}
          class="p-2 bg-bg-light rounded-lg border border-border hover:bg-highlight transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isDrawerOpen() ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar/Drawer */}
      <div
        class={`fixed top-0 left-0 h-full w-64 bg-bg-dark border-r border-border transform transition-transform duration-300 ease-in-out z-40 ${
          isDrawerOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div class="p-6">
          <h1 class="text-2xl font-bold text-primary mb-8">Event Horizon</h1>
          
          <nav class="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <A
                  href={item.path}
                  onClick={() => setIsDrawerOpen(false)}
                  class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-bg-light text-text hover:text-primary"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </A>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      <Show when={isDrawerOpen()}>
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleDrawer}
        />
      </Show>

      {/* Main content */}
      <div class="lg:ml-64">
        <main class="p-6">
          {props.children}
        </main>
      </div>
    </div>
  );
};