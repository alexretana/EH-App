
import type { Component } from 'solid-js';
import { createSignal, Show, For, onMount } from 'solid-js';
import { CheckCircle, Circle, XCircle, Clock, ArrowUpDown, List, LayoutGrid } from 'lucide-solid';
import { tasksApi, type Task } from '../services/api';

export const TasksView: Component = () => {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [viewMode, setViewMode] = createSignal<'checklist' | 'kanban'>('checklist');
  const [filter, setFilter] = createSignal<'all' | 'goals' | 'milestones'>('all');
  const [sortBy, setSortBy] = createSignal<'dependency' | 'status'>('status');
  const [loading, setLoading] = createSignal(true);

  const loadData = async () => {
    try {
      setLoading(true);
      let tasksData: Task[] = [];
      
      switch (filter()) {
        case 'all':
          tasksData = await tasksApi.getActiveProjectsTasks();
          break;
        case 'goals':
          tasksData = await tasksApi.getActiveGoalsTasks();
          break;
        case 'milestones':
          tasksData = await tasksApi.getActiveWeeklyMilestoneTasks();
          break;
      }
      
      // Sort tasks
      if (sortBy() === 'status') {
        tasksData.sort((a, b) => {
          const statusOrder = { 'Active': 0, 'Not started': 1, 'Done': 2, 'Cancelled': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
      } else {
        // For dependency sorting, we'd need more complex logic with the dependency data
        // For now, just sort by creation date (newest first)
        tasksData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadData();
  });

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await tasksApi.updateStatus(taskId, status);
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle size={16} class="text-success" />;
      case 'Active':
        return <Circle size={16} class="text-warning" />;
      case 'Cancelled':
        return <XCircle size={16} class="text-danger" />;
      default:
        return <Circle size={16} class="text-muted" />;
    }
  };

  const getTaskStatusButtons = (task: Task) => {
    switch (task.status) {
      case 'Not started':
        return (
          <button
            onClick={() => updateTaskStatus(task.id, 'Active')}
            class="px-3 py-1 bg-warning text-bg-dark rounded hover:bg-warning/80 transition-colors"
          >
            Start
          </button>
        );
      case 'Active':
        return (
          <div class="flex space-x-2">
            <button
              onClick={() => updateTaskStatus(task.id, 'Not started')}
              class="px-2 py-1 bg-muted text-text rounded hover:bg-highlight transition-colors text-sm"
            >
              Pause
            </button>
            <button
              onClick={() => updateTaskStatus(task.id, 'Done')}
              class="px-2 py-1 bg-success text-bg-dark rounded hover:bg-success/80 transition-colors text-sm"
            >
              Complete
            </button>
            <button
              onClick={() => updateTaskStatus(task.id, 'Cancelled')}
              class="px-2 py-1 bg-danger text-bg-dark rounded hover:bg-danger/80 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        );
      case 'Done':
      case 'Cancelled':
        return (
          <button
            onClick={() => updateTaskStatus(task.id, 'Active')}
            class="px-3 py-1 bg-primary text-bg-dark rounded hover:bg-primary/80 transition-colors"
          >
            Reactivate
          </button>
        );
      default:
        return null;
    }
  };

  const getStatusColumnColor = (status: string) => {
    switch (status) {
      case 'Not started':
        return 'bg-muted/20 border-muted';
      case 'Active':
        return 'bg-warning/20 border-warning';
      case 'Done':
        return 'bg-success/20 border-success';
      case 'Cancelled':
        return 'bg-danger/20 border-danger';
      default:
        return 'bg-bg-light border-border';
    }
  };

  return (
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Tasks</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-bg-light rounded-lg p-1">
            <button
              onClick={() => setViewMode('checklist')}
              class={`p-2 rounded ${viewMode() === 'checklist' ? 'bg-primary text-bg-dark' : 'text-text-muted'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              class={`p-2 rounded ${viewMode() === 'kanban' ? 'bg-primary text-bg-dark' : 'text-text-muted'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              name="filter"
              checked={filter() === 'all'}
              onChange={() => setFilter('all')}
              class="text-primary"
            />
            <span>All tasks in active projects</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              name="filter"
              checked={filter() === 'goals'}
              onChange={() => setFilter('goals')}
              class="text-primary"
            />
            <span>Only in active goals</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              name="filter"
              checked={filter() === 'milestones'}
              onChange={() => setFilter('milestones')}
              class="text-primary"
            />
            <span>Only in active weekly-milestones</span>
          </label>
        </div>
        
        <button
          onClick={() => setSortBy(sortBy() === 'dependency' ? 'status' : 'dependency')}
          class="flex items-center space-x-2 px-4 py-2 bg-bg-light border border-border rounded-lg hover:bg-highlight transition-colors"
        >
          <ArrowUpDown size={16} />
          <span>Sort by {sortBy() === 'dependency' ? 'dependency order' : 'status'}</span>
        </button>
      </div>

      <Show when={loading()}>
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-4 text-text-muted">Loading tasks...</p>
        </div>
      </Show>

      <Show when={!loading() && tasks().length === 0}>
        <div class="text-center py-12">
          <h2 class="text-2xl font-semibold text-text-muted">No tasks found</h2>
          <p class="mt-2 text-text-muted">Try changing the filter or check if there are any active projects.</p>
        </div>
      </Show>

      <Show when={!loading() && tasks().length > 0}>
        <Show when={viewMode() === 'checklist'}>
          <div class="space-y-4">
            <For each={tasks()}>
              {(task) => (
                <div class="bg-bg-light border border-border rounded-lg p-6">
                  <div class="flex justify-between items-center">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <h3 class="font-medium">{task.name}</h3>
                        {task.time_estimate_minutes && (
                          <span class="flex items-center space-x-1 text-text-muted">
                            <Clock size={14} />
                            <span class="text-sm">{Math.round(task.time_estimate_minutes / 60)}h</span>
                          </span>
                        )}
                      </div>
                      <div class="mt-2 flex items-center space-x-4 text-sm text-text-muted">
                        <span>Project: {task.project_name}</span>
                        <span>Goal: {task.goal_name}</span>
                        <span>Status: {task.status}</span>
                      </div>
                      {task.description && (
                        <p class="mt-2 text-sm text-text-muted">{task.description}</p>
                      )}
                    </div>
                    <div class="ml-4">
                      {getTaskStatusButtons(task)}
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={viewMode() === 'kanban'}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Not started', 'Active', 'Done', 'Cancelled'].map(status => (
              <div class={`bg-bg-light border rounded-lg p-6 ${getStatusColumnColor(status)}`}>
                <h3 class="font-semibold mb-6 flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span>{status}</span>
                  <span class="text-sm text-text-muted">
                    ({tasks().filter(t => t.status === status).length})
                  </span>
                </h3>
                <div class="space-y-4">
                  <For each={tasks().filter(t => t.status === status)}>
                    {(task) => (
                      <div class="bg-bg border border-border rounded p-4">
                        <div class="flex justify-between items-start mb-2">
                          <h4 class="font-medium text-sm">{task.name}</h4>
                          {task.time_estimate_minutes && (
                            <span class="flex items-center space-x-1 text-text-muted">
                              <Clock size={12} />
                              <span class="text-xs">{Math.round(task.time_estimate_minutes / 60)}h</span>
                            </span>
                          )}
                        </div>
                        <div class="text-xs text-text-muted mb-2">
                          <div>Project: {task.project_name}</div>
                          <div>Goal: {task.goal_name}</div>
                        </div>
                        {task.description && (
                          <p class="text-xs text-text-muted mb-2">{task.description}</p>
                        )}
                        <div class="mt-2">
                          {getTaskStatusButtons(task)}
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            ))}
          </div>
        </Show>
      </Show>
    </div>
  );
};