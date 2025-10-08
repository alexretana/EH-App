import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import AnimatedPage from '@/components/layout/AnimatedPage';
import ProjectView from '@/views/ProjectView';
import KnowledgeBaseView from '@/views/KnowledgeBaseView';
import TaskView from '@/views/TaskView';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppProvider>
          <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={
              <AnimatedPage>
                <ProjectView />
              </AnimatedPage>
            } />
            <Route path="/knowledge" element={
              <AnimatedPage>
                <KnowledgeBaseView />
              </AnimatedPage>
            } />
            <Route path="/tasks" element={
              <AnimatedPage>
                <TaskView />
              </AnimatedPage>
            } />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
        <Toaster />
      </AppProvider>
    </TooltipProvider>
    </BrowserRouter>
  );
};

export default AppRouter;