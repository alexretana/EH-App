import type { Component } from 'solid-js';
import { createSignal, Show, onMount } from 'solid-js';
import { X } from 'lucide-solid';
import { projectsApi, type Project, type ProjectCreate } from '../services/api';

interface ProjectModalProps {
  show: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: () => void;
}

export const ProjectModal: Component<ProjectModalProps> = (props) => {
  const [formData, setFormData] = createSignal<ProjectCreate>({
    name: '',
    description: '',
    status: 'Planning Phase',
    start_date: '',
    end_date: '',
    is_active: false,
    is_validated: false,
    time_estimate_months: undefined,
    time_estimation_validated: false,
    expansion_horizon: undefined,
    milestone_granularity: undefined,
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  onMount(() => {
    if (props.project) {
      setFormData({
        name: props.project.name,
        description: props.project.description || '',
        status: props.project.status,
        start_date: props.project.start_date || '',
        end_date: props.project.end_date || '',
        is_active: props.project.is_active,
        is_validated: props.project.is_validated,
        time_estimate_months: props.project.time_estimate_months || undefined,
        time_estimation_validated: props.project.time_estimation_validated,
        expansion_horizon: props.project.expansion_horizon || undefined,
        milestone_granularity: props.project.milestone_granularity || undefined,
      });
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (props.project) {
        await projectsApi.update(props.project.id, formData());
      } else {
        await projectsApi.create(formData());
      }
      props.onSave();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProjectCreate) => (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({
      ...formData(),
      [field]: field === 'time_estimate_months' ? (value ? parseInt(value as string) : undefined) : value,
    });
  };

  return (
    <Show when={props.show}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="modal-backdrop absolute inset-0" onClick={props.onClose}></div>
        <div class="relative bg-bg border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="sticky top-0 bg-bg border-b border-border p-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              {props.project ? 'Edit Project' : 'Create New Project'}
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
              <label class="block text-sm font-medium mb-1">Project Name *</label>
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
              <label class="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData().status}
                onChange={handleInputChange('status')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Planning Phase">Planning Phase</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData().start_date}
                  onInput={handleInputChange('start_date')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData().end_date}
                  onInput={handleInputChange('end_date')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Time Estimate (months)</label>
              <input
                type="number"
                min="1"
                value={formData().time_estimate_months || ''}
                onInput={handleInputChange('time_estimate_months')}
                class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Expansion Horizon</label>
                <select
                  value={formData().expansion_horizon || ''}
                  onChange={handleInputChange('expansion_horizon')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select horizon</option>
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="3 Weeks">3 Weeks</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Milestone Granularity</label>
                <select
                  value={formData().milestone_granularity || ''}
                  onChange={handleInputChange('milestone_granularity')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select granularity</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly&Quarterly">Monthly & Quarterly</option>
                </select>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData().is_active}
                  onChange={handleInputChange('is_active')}
                  class="rounded border-border bg-bg-light text-primary focus:ring-primary"
                />
                <span class="text-sm">Active</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData().is_validated}
                  onChange={handleInputChange('is_validated')}
                  class="rounded border-border bg-bg-light text-primary focus:ring-primary"
                />
                <span class="text-sm">Validated</span>
              </label>
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
                {loading() ? 'Saving...' : (props.project ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};