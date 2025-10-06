import type { Component } from 'solid-js';
import { createSignal, Show, onMount, createEffect } from 'solid-js';
import { X, Edit3, Eye } from 'lucide-solid';
import { knowledgeApi, projectsApi, goalsApi, tasksApi, type KnowledgeBase, type KnowledgeBaseCreate, type Project, type Goal, type Task } from '../services/api';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface KnowledgeModalProps {
  show: boolean;
  onClose: () => void;
  document?: KnowledgeBase | null;
  onSave: () => void;
}

export const KnowledgeModal: Component<KnowledgeModalProps> = (props) => {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [goals, setGoals] = createSignal<Goal[]>([]);
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [isEditMode, setIsEditMode] = createSignal(false);
  const [formData, setFormData] = createSignal<KnowledgeBaseCreate>({
    document_name: '',
    content: '',
    ai_summary: '',
    link_citations: [],
    related_projects: [],
    related_goals: [],
    related_tasks: [],
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [renderedContent, setRenderedContent] = createSignal('');

  // Load data when modal opens
  createEffect(() => {
    if (props.show) {
      loadRelatedData();
    }
  });

  // Initialize form data when document changes
  createEffect(() => {
    if (props.document) {
      setFormData({
        document_name: props.document.document_name,
        content: props.document.content || '',
        ai_summary: props.document.ai_summary || '',
        link_citations: props.document.link_citations || [],
        related_projects: [],
        related_goals: [],
        related_tasks: [],
      });
      
      // Set related entities based on entity types and IDs
      if (props.document.related_entity_ids && props.document.entity_types) {
        const relatedProjects: string[] = [];
        const relatedGoals: string[] = [];
        const relatedTasks: string[] = [];
        
        props.document.entity_types.forEach((type, index) => {
          const entityId = props.document.related_entity_ids?.[index];
          if (entityId) {
            if (type === 'project') relatedProjects.push(entityId);
            else if (type === 'goal') relatedGoals.push(entityId);
            else if (type === 'task') relatedTasks.push(entityId);
          }
        });
        
        setFormData({
          ...formData(),
          related_projects: relatedProjects,
          related_goals: relatedGoals,
          related_tasks: relatedTasks,
        });
      }
      
      // Render markdown content
      if (props.document.content) {
        const html = marked(props.document.content);
        setRenderedContent(DOMPurify.sanitize(html));
      }
      
      setIsEditMode(false);
    } else {
      setFormData({
        document_name: '',
        content: '',
        ai_summary: '',
        link_citations: [],
        related_projects: [],
        related_goals: [],
        related_tasks: [],
      });
      setRenderedContent('');
      setIsEditMode(true);
    }
  });

  const loadRelatedData = async () => {
    try {
      const [projectsData, goalsData, tasksData] = await Promise.all([
        projectsApi.getAll(),
        goalsApi.getAll(),
        tasksApi.getAll(),
      ]);
      setProjects(projectsData);
      setGoals(goalsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error loading related data:', err);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (props.document) {
        await knowledgeApi.update(props.document.id, formData());
      } else {
        await knowledgeApi.create(formData());
      }
      props.onSave();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof KnowledgeBaseCreate) => (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({
      ...formData(),
      [field]: value,
    });
  };

  const handleCitationsChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const citations = target.value.split('\n').filter(citation => citation.trim());
    setFormData({
      ...formData(),
      link_citations: citations,
    });
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode());
  };

  return (
    <Show when={props.show}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="modal-backdrop absolute inset-0" onClick={props.onClose}></div>
        <div class="relative bg-bg border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="sticky top-0 bg-bg border-b border-border p-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              {props.document ? 'Knowledge Document' : 'Create New Document'}
            </h2>
            <div class="flex items-center space-x-2">
              <Show when={props.document}>
                <button
                  onClick={toggleEditMode}
                  class="flex items-center space-x-1 px-3 py-1 text-sm bg-secondary text-bg-dark rounded hover:bg-secondary/80 transition-colors"
                >
                  {isEditMode() ? <Eye size={14} /> : <Edit3 size={14} />}
                  <span>{isEditMode() ? 'Read' : 'Edit'}</span>
                </button>
              </Show>
              <button
                onClick={props.onClose}
                class="p-1 hover:bg-highlight rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <Show when={isEditMode()}>
            <form onSubmit={handleSubmit} class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Document Name *</label>
                <input
                  type="text"
                  value={formData().document_name}
                  onInput={handleInputChange('document_name')}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Content (Markdown)</label>
                <textarea
                  value={formData().content}
                  onInput={handleInputChange('content')}
                  rows={10}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">AI Summary</label>
                <textarea
                  value={formData().ai_summary}
                  onInput={handleInputChange('ai_summary')}
                  rows={3}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Link Citations (one per line)</label>
                <textarea
                  value={formData().link_citations?.join('\n') || ''}
                  onInput={handleCitationsChange}
                  rows={3}
                  class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Related Projects</label>
                  <select
                    multiple
                    value={formData().related_projects || []}
                    onChange={(e) => {
                      const selected = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value);
                      setFormData({ ...formData(), related_projects: selected });
                    }}
                    class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    size={4}
                  >
                    {projects().map(project => (
                      <option value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Related Goals</label>
                  <select
                    multiple
                    value={formData().related_goals || []}
                    onChange={(e) => {
                      const selected = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value);
                      setFormData({ ...formData(), related_goals: selected });
                    }}
                    class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    size={4}
                  >
                    {goals().map(goal => (
                      <option value={goal.id}>{goal.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Related Tasks</label>
                  <select
                    multiple
                    value={formData().related_tasks || []}
                    onChange={(e) => {
                      const selected = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value);
                      setFormData({ ...formData(), related_tasks: selected });
                    }}
                    class="w-full px-3 py-2 bg-bg-light border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    size={4}
                  >
                    {tasks().map(task => (
                      <option value={task.id}>{task.name}</option>
                    ))}
                  </select>
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
                  {loading() ? 'Saving...' : (props.document ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </Show>

          <Show when={!isEditMode() && props.document}>
            <div class="p-6">
              <h3 class="text-2xl font-bold mb-4">{props.document.document_name}</h3>
              
              <Show when={props.document.content}>
                <div class="mb-6">
                  <h4 class="text-lg font-semibold mb-2">Content</h4>
                  <div class="bg-bg-light p-4 rounded border border-border markdown-content" innerHTML={renderedContent()} />
                </div>
              </Show>

              <Show when={props.document.ai_summary}>
                <div class="mb-6">
                  <h4 class="text-lg font-semibold mb-2">AI Summary</h4>
                  <p class="text-text-muted bg-bg-light p-4 rounded border border-border">
                    {props.document.ai_summary}
                  </p>
                </div>
              </Show>

              <Show when={props.document.link_citations && props.document.link_citations.length > 0}>
                <div class="mb-6">
                  <h4 class="text-lg font-semibold mb-2">Citations</h4>
                  <ul class="list-disc list-inside space-y-1">
                    {props.document.link_citations.map(citation => (
                      <li class="text-text-muted">
                        <a href={citation} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                          {citation}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Show>

              <Show when={props.document.related_entities && props.document.related_entities.length > 0}>
                <div>
                  <h4 class="text-lg font-semibold mb-2">Related Entities</h4>
                  <div class="flex flex-wrap gap-2">
                    {props.document.related_entities.map((entity, index) => (
                      <span class="px-3 py-1 bg-highlight text-text rounded-full text-sm">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};