import type { Component } from 'solid-js';
import { createSignal, Show, onMount, createEffect } from 'solid-js';
import { X } from 'lucide-solid';
import { goalsApi, projectsApi, type Goal, type GoalCreate, type Project } from '../services/api';

interface GoalModalProps {
  show: boolean;
  onClose: () => void;
  goal?: Goal | null;
  parentGoalId?: string | null;
  onSave: () => void;
}

export const GoalModal: Component<GoalModalProps> = (props) => {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [parentGoals, setParentGoals] = createSignal<Goal[]>([]);
  const [formData, setFormData] = createSignal<GoalCreate>({
    name: '',
    description: '',
    status: 'Not started',
    scope: undefined,
    success_criteria: '',
    due_date: '',
    project_id: '',
    parent_goal_id: undefined,
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  // Load projects when modal opens
  createEffect(() => {
    if (props.show) {
      loadProjects();
    }
  });

  // Load parent goals when project is selected
  createEffect(() => {
    const projectId = formData().project_id;
    if (projectId && props.show) {
      loadParentGoals(projectId);
    }
  });

  // Initialize form data when goal or parentGoalId changes
  createEffect(() => {
    if (props.goal) {
      setFormData({
        name: props.goal.name,
        description: props.goal.description || '',
        status: props.goal.status,
        scope: props.goal.scope || undefined,
        success_criteria: props.goal.success_criteria || '',
        due_date: props.goal.due_date || '',
        project_id: props.goal.project_id,
        parent_goal_id: props.goal.parent_goal_id || undefined,
      });
    } else if (props.parentGoalId) {
      // For creating weekly milestone, get the project from parent goal
      goalsApi.getById(props.parentGoalId).then(parentGoal => {
        setFormData({
          ...formData(),
          project_id: parentGoal.project_id,
          parent_goal_id: props.parentGoalId || undefined,
          scope: 'Weekly-Milestone',
        });
      });
    } else if ((window as any).tempProjectId) {
      // For creating a new goal from project view
      setFormData({
        ...formData(),
        project_id: (window as any).tempProjectId,
      });
      delete (window as any).tempProjectId;
    }
  });

  const loadProjects = async () => {
    try {
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadParentGoals = async (projectId: string) => {
    try {
      const goalsData = await goalsApi.getProjectHierarchy(projectId);
      // Filter for monthly/quarterly goals that can be parents
      const parentGoalsData = goalsData.filter(goal => 
        !goal.parent_goal_id && 
        (goal.scope === 'Monthly' || goal.scope === 'Quarterly')
      );
      setParentGoals(parentGoalsData);
    } catch (err) {
      console.error('Error loading parent goals:', err);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate weekly milestone has parent
      if (formData().scope === 'Weekly-Milestone' && !formData().parent_goal_id) {
        setError('Weekly milestones must have a parent goal');
        return;
      }

      if (props.goal) {
        await goalsApi.update(props.goal.id, formData());
      } else {
        await goalsApi.create(formData());
      }
      props.onSave();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GoalCreate) => (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({
      ...formData(),
      [field]: value,
    });
  };

  return (
    <Show when={props.show}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="modal-backdrop absolute inset-0" onClick={props.onClose}></div>
        <div class="relative bg-bg border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="sticky top-0 bg-bg border-b border-border p-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              {props.goal ? 'Edit Goal' : 'Create New Goal'}
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
              <label class="block text-sm font-medium mb-1">Goal Name *</label>
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
              <label class="block text-sm font-medium mb-1">Project *</label>
              <select
                value={formData().project_id}
                onChange={handleInputChange('project_id')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={!!props.goal || !!props.parentGoalId}
              >
                <option value="">Select a project</option>
                {projects().map(project => (
                  <option value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Scope *</label>
              <select
                value={formData().scope || ''}
                onChange={handleInputChange('scope')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={props.parentGoalId !== null} // Disable if creating weekly milestone
              >
                <option value="">Select scope</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Weekly-Milestone">Weekly Milestone</option>
              </select>
            </div>

            <Show when={formData().scope === 'Weekly-Milestone' && !props.parentGoalId}>
              <div>
                <label class="block text-sm font-medium mb-1">Parent Goal *</label>
                <select
                  value={formData().parent_goal_id || ''}
                  onChange={handleInputChange('parent_goal_id')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a parent goal</option>
                  {parentGoals().map(goal => (
                    <option value={goal.id}>{goal.name}</option>
                  ))}
                </select>
              </div>
            </Show>

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
              <label class="block text-sm font-medium mb-1">Success Criteria</label>
              <textarea
                value={formData().success_criteria}
                onInput={handleInputChange('success_criteria')}
                rows={2}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData().due_date}
                onInput={handleInputChange('due_date')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
                {loading() ? 'Saving...' : (props.goal ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};