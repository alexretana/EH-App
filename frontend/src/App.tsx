import type { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { Layout } from './components/Layout';
import { ProjectView } from './views/ProjectView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { TasksView } from './views/TasksView';

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route path="/" component={ProjectView} />
        <Route path="/projects" component={ProjectView} />
        <Route path="/knowledge" component={KnowledgeBaseView} />
        <Route path="/tasks" component={TasksView} />
      </Route>
    </Router>
  );
};

export default App;
