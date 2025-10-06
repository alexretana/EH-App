
import type { Component } from 'solid-js';
import { createSignal, Show, onMount, createEffect } from 'solid-js';
import { X } from 'lucide-solid';
import { tasksApi, goalsApi, type Task, type TaskCreate, type Goal } from '../services/api';

interface TaskModalProps {
  show: boolean;
  onClose: () => void;
  goalId?: string | null;
  onSave: () => void;
}

export const TaskModal: Component<TaskModalProps> = (props) => {
  const [goals, setGoals] = createSignal<Goal[]>([]);
  const [formData, setFormData] = createSignal<TaskCreate>({
    name: '',
    description: '',
    status: 'Not started',
    task_type: undefined,
    priority: undefined,
    effort_level: undefined,
    time_estimate_minutes: undefined,
    due_date: '',
    date_completed: '',
    week_start_date: '',
    assignee: '',
    goal_id: '',
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  // Load goals when modal opens
  createEffect(() => {
    if (props.show) {
      loadGoals();
    }
  });

  // Initialize form data when goalId changes or when editing
  createEffect(() => {
    if (props.goalId) {
      setFormData({
        ...formData(),
        goal_id: props.goalId,
      });
    }
    
    // Check if we're editing an existing task
    const tempTask = (window as any).tempTask;
    if (tempTask) {
      setFormData({
        name: tempTask.name,
        description: tempTask.description || '',
        status: tempTask.status,
        task_type: tempTask.task_type || undefined,
        priority: tempTask.priority || undefined,
        effort_level: tempTask.effort_level || undefined,
        time_estimate_minutes: tempTask.time_estimate_minutes || undefined,
        due_date: tempTask.due_date || '',
        date_completed: tempTask.date_completed || '',
        week_start_date: tempTask.week_start_date || '',
        assignee: tempTask.assignee || '',
        goal_id: tempTask.goal_id,
      });
      delete (window as any).tempTask;
    }
  });

  const loadGoals = async () => {
    try {
      const goalsData = await goalsApi.getAll();
      setGoals(goalsData);
    } catch (err) {
      console.error('Error loading goals:', err);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tempTask = (window as any).tempTask;
      if (tempTask) {
        await tasksApi.update(tempTask.id, formData());
      } else {
        await tasksApi.create(formData());
      }
      props.onSave();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaskCreate) => (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({
      ...formData(),
      [field]: field === 'time_estimate_minutes' ? (value ? parseInt(value as string) : undefined) : value,
    });
  };

  return (
    <Show when={props.show}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="modal-backdrop absolute inset-0" onClick={props.onClose}></div>
        <div class="relative bg-bg border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="sticky top-0 bg-bg border-b border-border p-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              {(window as any).tempTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={props.onClose}
              class="p-1 hover:bg-highlight rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Task Name *</label>
              <input
                type="text"
                value={formData().name}
                onInput={handleInputChange('name')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData().description}
                onInput={handleInputChange('description')}
                rows={3}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Goal *</label>
              <select
                value={formData().goal_id}
                onChange={handleInputChange('goal_id')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={!!props.goalId}
              >
                <option value="">Select a goal</option>
                {goals().map(goal => (
                  <option value={goal.id}>{goal.name}</option>
                ))}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData().status}
                  onChange={handleInputChange('status')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Not started">Not started</option>
                  <option value="Active">Active</option>
                  <option value="Done">Done</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Task Type</label>
                <select
                  value={formData().task_type || ''}
                  onChange={handleInputChange('task_type')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select type</option>
                  <option value="Network">Network</option>
                  <option value="Debug">Debug</option>
                  <option value="Review">Review</option>
                  <option value="Develop">Develop</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Provision">Provision</option>
                  <option value="Research">Research</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData().priority || ''}
                  onChange={handleInputChange('priority')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Effort Level</label>
                <select
                  value={formData().effort_level || ''}
                  onChange={handleInputChange('effort_level')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select effort</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Time Estimate (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData().time_estimate_minutes || ''}
                  onInput={handleInputChange('time_estimate_minutes')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Assignee</label>
                <input
                  type="text"
                  value={formData().assignee}
                  onInput={handleInputChange('assignee')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData().due_date}
                  onInput={handleInputChange('due_date')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Week Start Date</label>
                <input
                  type="date"
                  value={formData().week_start_date}
                  onInput={handleInputChange('week_start_date')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Show when={error()}>
              <div class="p-3 bg-danger/20 border border-danger rounded text-danger text-sm">
                {error()}
              </div>
            </Show>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={props.onClose}
                class="px-4 py-2 border border-border rounded hover:bg-highlight transition-colors"
                disabled={loading()}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary text-bg-dark rounded hover:bg-primary/80 transition-colors"
                disabled={loading()}
              >
                {loading() ? 'Saving...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};