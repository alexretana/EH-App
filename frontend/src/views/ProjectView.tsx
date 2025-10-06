import type { Component } from 'solid-js';
import { createSignal, Show, For, onMount } from 'solid-js';
import { Plus, Edit2, ChevronDown, ChevronRight, Clock, CheckCircle, Circle, XCircle } from 'lucide-solid';
import { projectsApi, goalsApi, tasksApi, type Project, type Goal, type Task } from '../services/api';
import { ProjectModal } from '../components/ProjectModal';
import { GoalModal } from '../components/GoalModal';
import { TaskModal } from '../components/TaskModal';

export const ProjectView: Component = () => {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [goals, setGoals] = createSignal<Goal[]>([]);
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [expandedProjects, setExpandedProjects] = createSignal<Set<string>>(new Set());
  const [expandedGoals, setExpandedGoals] = createSignal<Set<string>>(new Set());
  const [showProjectModal, setShowProjectModal] = createSignal(false);
  const [showGoalModal, setShowGoalModal] = createSignal(false);
  const [showTaskModal, setShowTaskModal] = createSignal(false);
  const [editingProject, setEditingProject] = createSignal<Project | null>(null);
  const [editingGoal, setEditingGoal] = createSignal<Goal | null>(null);
  const [parentGoalId, setParentGoalId] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);
      
      // Load goals for all projects
      const allGoals: Goal[] = [];
      for (const project of projectsData) {
        const projectGoals = await projectsApi.getGoals(project.id);
        allGoals.push(...projectGoals);
      }
      setGoals(allGoals);
      
      // Load tasks for all goals
      const allTasks: Task[] = [];
      for (const goal of allGoals) {
        const goalTasks = await goalsApi.getTasks(goal.id);
        allTasks.push(...goalTasks);
      }
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadData();
  });

  const toggleProjectExpansion = (projectId: string) => {
    const expanded = new Set(expandedProjects());
    if (expanded.has(projectId)) {
      expanded.delete(projectId);
    } else {
      expanded.add(projectId);
    }
    setExpandedProjects(expanded);
  };

  const toggleGoalExpansion = (goalId: string) => {
    const expanded = new Set(expandedGoals());
    if (expanded.has(goalId)) {
      expanded.delete(goalId);
    } else {
      expanded.add(goalId);
    }
    setExpandedGoals(expanded);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleCreateGoal = (projectId: string) => {
    setEditingGoal(null);
    setParentGoalId(null);
    // Store the project ID for the new goal
    (window as any).tempProjectId = projectId;
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setParentGoalId(null);
    setShowGoalModal(true);
  };

  const handleCreateWeeklyMilestone = (parentGoalId: string) => {
    setEditingGoal(null);
    setParentGoalId(parentGoalId);
    setShowGoalModal(true);
  };

  const handleCreateTask = (goalId: string) => {
    setEditingGoal(null);
    setParentGoalId(goalId);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingGoal(null);
    setParentGoalId(task.goal_id);
    // Store the task for editing
    (window as any).tempTask = task;
    setShowTaskModal(true);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await tasksApi.updateStatus(taskId, status);
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getProjectGoals = (projectId: string) => {
    return goals().filter(goal => goal.project_id === projectId && !goal.parent_goal_id);
  };

  const getGoalChildren = (parentGoalId: string) => {
    return goals().filter(goal => goal.parent_goal_id === parentGoalId);
  };

  const getGoalTasks = (goalId: string) => {
    return tasks().filter(task => task.goal_id === goalId);
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

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Projects</h1>
        <button
          onClick={handleCreateProject}
          class="flex items-center space-x-2 px-4 py-2 bg-primary text-bg-dark rounded-lg hover:bg-primary/80 transition-colors"
        >
          <Plus size={20} />
          <span>Add Project</span>
        </button>
      </div>

      <Show when={loading()}>
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-4 text-text-muted">Loading projects...</p>
        </div>
      </Show>

      <Show when={!loading() && projects().length === 0}>
        <div class="text-center py-12">
          <h2 class="text-2xl font-semibold text-text-muted">Create Your First Project</h2>
          <p class="mt-2 text-text-muted">Get started by creating your first project to organize your goals and tasks.</p>
        </div>
      </Show>

      <Show when={!loading() && projects().length > 0}>
        <div class="space-y-4">
          <For each={projects()}>
            {(project) => (
              <div class="bg-bg-light border border-border rounded-lg overflow-hidden">
                <div class="p-4">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                      <button
                        onClick={() => toggleProjectExpansion(project.id)}
                        class="p-1 hover:bg-highlight rounded transition-colors"
                      >
                        {expandedProjects().has(project.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                      <div>
                        <h3 class="text-xl font-semibold">{project.name}</h3>
                        <div class="flex items-center space-x-4 mt-1">
                          <span class="flex items-center space-x-1 text-text-muted">
                            {getStatusIcon(project.status)}
                            <span class="text-sm">{project.status}</span>
                          </span>
                          {project.time_estimate_months && (
                            <span class="flex items-center space-x-1 text-text-muted">
                              <Clock size={14} />
                              <span class="text-sm">{project.time_estimate_months} months</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        class="p-2 hover:bg-highlight rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <Show when={expandedProjects().has(project.id)}>
                  <div class="border-t border-border">
                    <div class="p-4 space-y-2">
                      <For each={getProjectGoals(project.id)}>
                        {(goal) => (
                          <div class="bg-bg border border-border-muted rounded-lg">
                            <div class="p-3">
                              <div class="flex justify-between items-center">
                                <div class="flex items-center space-x-3">
                                  <button
                                    onClick={() => toggleGoalExpansion(goal.id)}
                                    class="p-1 hover:bg-highlight rounded transition-colors"
                                  >
                                    {expandedGoals().has(goal.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                  </button>
                                  <div>
                                    <h4 class="font-medium">{goal.name}</h4>
                                    <div class="flex items-center space-x-3 mt-1">
                                      <span class="flex items-center space-x-1 text-text-muted">
                                        {getStatusIcon(goal.status)}
                                        <span class="text-sm">{goal.status}</span>
                                      </span>
                                      <span class="text-sm text-text-muted">{goal.scope}</span>
                                      {goal.task_count !== undefined && (
                                        <span class="text-sm text-text-muted">
                                          {goal.completed_tasks || 0}/{goal.task_count} tasks
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div class="flex space-x-2">
                                  <button
                                    onClick={() => handleEditGoal(goal)}
                                    class="p-1 hover:bg-highlight rounded transition-colors"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <Show when={goal.scope !== 'Weekly-Milestone'}>
                                    <button
                                      onClick={() => handleCreateWeeklyMilestone(goal.id)}
                                      class="p-1 hover:bg-highlight rounded transition-colors"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </Show>
                                </div>
                              </div>
                            </div>

                            <Show when={expandedGoals().has(goal.id)}>
                              <div class="border-t border-border-muted">
                                <div class="p-3 space-y-2">
                                  <For each={getGoalChildren(goal.id)}>
                                    {(childGoal) => (
                                      <div class="bg-bg-dark border border-border-muted rounded-lg ml-4">
                                        <div class="p-3">
                                          <div class="flex justify-between items-center">
                                            <div class="flex items-center space-x-3">
                                              <button
                                                onClick={() => toggleGoalExpansion(childGoal.id)}
                                                class="p-1 hover:bg-highlight rounded transition-colors"
                                              >
                                                {expandedGoals().has(childGoal.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                              </button>
                                              <div>
                                                <h5 class="font-medium text-sm">{childGoal.name}</h5>
                                                <div class="flex items-center space-x-2 mt-1">
                                                  <span class="flex items-center space-x-1 text-text-muted">
                                                    {getStatusIcon(childGoal.status)}
                                                    <span class="text-xs">{childGoal.status}</span>
                                                  </span>
                                                  <span class="text-xs text-text-muted">{childGoal.scope}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div class="flex space-x-1">
                                              <button
                                                onClick={() => handleEditGoal(childGoal)}
                                                class="p-1 hover:bg-highlight rounded transition-colors"
                                              >
                                                <Edit2 size={12} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        <Show when={expandedGoals().has(childGoal.id)}>
                                          <div class="border-t border-border-muted">
                                            <div class="p-3 space-y-2">
                                              <For each={getGoalTasks(childGoal.id)}>
                                                {(task) => (
                                                  <div class="bg-bg-light border border-border-muted rounded ml-4 p-2">
                                                    <div class="flex justify-between items-center">
                                                      <div class="flex items-center space-x-2">
                                                        {getStatusIcon(task.status)}
                                                        <span class="text-sm">{task.name}</span>
                                                        {task.time_estimate_minutes && (
                                                          <span class="text-xs text-text-muted flex items-center space-x-1">
                                                            <Clock size={10} />
                                                            <span>{Math.round(task.time_estimate_minutes / 60)}h</span>
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div class="flex items-center space-x-2">
                                                        {getTaskStatusButtons(task)}
                                                        <button
                                                          onClick={() => handleEditTask(task)}
                                                          class="p-1 hover:bg-highlight rounded transition-colors"
                                                        >
                                                          <Edit2 size={12} />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </For>
                                              <button
                                                onClick={() => handleCreateTask(childGoal.id)}
                                                class="w-full p-2 border border-dashed border-border-muted rounded hover:bg-highlight transition-colors text-sm text-text-muted"
                                              >
                                                + Add new task
                                              </button>
                                            </div>
                                          </div>
                                        </Show>
                                      </div>
                                    )}
                                  </For>
                                  
                                  <For each={getGoalTasks(goal.id)}>
                                    {(task) => (
                                      <div class="bg-bg-dark border border-border-muted rounded-lg ml-4 p-2">
                                        <div class="flex justify-between items-center">
                                          <div class="flex items-center space-x-2">
                                            {getStatusIcon(task.status)}
                                            <span class="text-sm">{task.name}</span>
                                            {task.time_estimate_minutes && (
                                              <span class="text-xs text-text-muted flex items-center space-x-1">
                                                <Clock size={10} />
                                                <span>{Math.round(task.time_estimate_minutes / 60)}h</span>
                                              </span>
                                            )}
                                          </div>
                                          <div class="flex items-center space-x-2">
                                            {getTaskStatusButtons(task)}
                                            <button
                                              onClick={() => handleEditTask(task)}
                                              class="p-1 hover:bg-highlight rounded transition-colors"
                                            >
                                              <Edit2 size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </For>
                                  
                                  <button
                                    onClick={() => handleCreateTask(goal.id)}
                                    class="w-full p-2 border border-dashed border-border-muted rounded hover:bg-highlight transition-colors text-sm text-text-muted"
                                  >
                                    + Add new task
                                  </button>
                                </div>
                              </div>
                            </Show>
                          </div>
                        )}
                      </For>
                      
                      <button
                        onClick={() => handleCreateGoal(project.id)}
                        class="w-full p-3 border border-dashed border-border rounded hover:bg-highlight transition-colors text-text-muted"
                      >
                        + Add new goal
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Modals */}
      <ProjectModal
        show={showProjectModal()}
        onClose={() => setShowProjectModal(false)}
        project={editingProject()}
        onSave={() => {
          setShowProjectModal(false);
          loadData();
        }}
      />

      <GoalModal
        show={showGoalModal()}
        onClose={() => setShowGoalModal(false)}
        goal={editingGoal()}
        parentGoalId={parentGoalId()}
        onSave={() => {
          setShowGoalModal(false);
          loadData();
        }}
      />

      <TaskModal
        show={showTaskModal()}
        onClose={() => setShowTaskModal(false)}
        goalId={parentGoalId()}
        onSave={() => {
          setShowTaskModal(false);
          loadData();
        }}
      />
    </div>
  );
};