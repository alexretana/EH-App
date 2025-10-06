import type { Component } from 'solid-js';
import { Router } from '@solidjs/router';
import { Layout } from './components/Layout';
import { ProjectView } from './views/ProjectView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { TasksView } from './views/TasksView';

const App: Component = () => {
  return (
    <Router>
      <Layout>
        <ProjectView path="/" />
        <ProjectView path="/projects" />
        <KnowledgeBaseView path="/knowledge" />
        <TasksView path="/tasks" />
      </Layout>
    </Router>
  );
};

export default App;
