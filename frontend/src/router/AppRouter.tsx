import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import Layout from '@/components/layout/Layout';
import ProjectView from '@/views/ProjectView';
import KnowledgeBaseView from '@/views/KnowledgeBaseView';
import TaskView from '@/views/TaskView';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectView />} />
            <Route path="/knowledge" element={<KnowledgeBaseView />} />
            <Route path="/tasks" element={<TaskView />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
};

export default AppRouter;