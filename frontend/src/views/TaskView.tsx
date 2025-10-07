import React, { useState } from 'react';
import { List, LayoutGrid, Filter, ArrowUpDown, Plus, Edit, Trash2, Clock, Target, Play, Pause, CheckCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import TaskModal from '@/components/tasks/TaskModal';
import { Task } from '@/types/mockData';

const TaskView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'checklist' | 'kanban'>('checklist');
  const [filterOption, setFilterOption] = useState<'all' | 'active-projects' | 'active-goals' | 'active-milestones'>('all');
  const [sortOption, setSortOption] = useState<'dependency' | 'status'>('status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const { tasks, goals, projects, isLoading, error, createTask, updateTask, deleteTask } = useApp();

  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      await updateTask(id, { id, status });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-6 rounded-xl">
          <p className="text-glass">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-6 rounded-xl border border-danger/30">
          <p className="text-danger">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Filter tasks based on selected option
  const filteredTasks = tasks.filter(task => {
    const goal = goals.find(g => g.id === task.goal_id);
    if (!goal) return false;
    
    const project = projects.find(p => p.id === goal.project_id);
    if (!project) return false;
    
    switch (filterOption) {
      case 'active-projects':
        return project.is_active;
      case 'active-goals':
        return goal.status === 'Active' && goal.scope !== 'Weekly-Milestone';
      case 'active-milestones':
        return goal.status === 'Active' && goal.scope === 'Weekly-Milestone';
      default:
        return true;
    }
  });

  // Sort tasks based on selected option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === 'status') {
      const statusOrder = { 'Active': 0, 'Not started': 1, 'Done': 2, 'Cancelled': 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // If same status, sort by most recent
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    
    // Default sort or dependency sort would be implemented here
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'Network': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Debug': return 'bg-red-100 text-red-800 border-red-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Develop': return 'bg-green-100 text-green-800 border-green-200';
      case 'Marketing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Provision': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Research': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-glass">Tasks</h1>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="glass-button" onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </motion.div>
        </div>

        {/* View Controls */}
        <motion.div
          className="glass-card p-4 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-glass">View:</span>
              <div className="flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={viewMode === 'checklist' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('checklist')}
                    className="glass-button"
                  >
                    <List className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Checklist</span>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="glass-button"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Kanban</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            <Separator className="w-full" />

            {/* Filter Options */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-glass-muted" />
                <span className="text-sm font-medium text-glass">Show:</span>
              </div>
              <RadioGroup value={filterOption} onValueChange={(value: any) => setFilterOption(value)} className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="all" id="all" className="sr-only" />
                  <Label htmlFor="all" className={`text-xs px-2 py-1 rounded cursor-pointer ${
                    filterOption === 'all' ? 'bg-primary/20 text-primary' : 'text-glass-muted hover:bg-white/10'
                  }`}>
                    All
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="active-projects" id="active-projects" className="sr-only" />
                  <Label htmlFor="active-projects" className={`text-xs px-2 py-1 rounded cursor-pointer ${
                    filterOption === 'active-projects' ? 'bg-primary/20 text-primary' : 'text-glass-muted hover:bg-white/10'
                  }`}>
                    <span className="hidden sm:inline">Active Projects</span>
                    <span className="sm:hidden">Projects</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="active-goals" id="active-goals" className="sr-only" />
                  <Label htmlFor="active-goals" className={`text-xs px-2 py-1 rounded cursor-pointer ${
                    filterOption === 'active-goals' ? 'bg-primary/20 text-primary' : 'text-glass-muted hover:bg-white/10'
                  }`}>
                    <span className="hidden sm:inline">Active Goals</span>
                    <span className="sm:hidden">Goals</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="active-milestones" id="active-milestones" className="sr-only" />
                  <Label htmlFor="active-milestones" className={`text-xs px-2 py-1 rounded cursor-pointer ${
                    filterOption === 'active-milestones' ? 'bg-primary/20 text-primary' : 'text-glass-muted hover:bg-white/10'
                  }`}>
                    <span className="hidden sm:inline">Active Milestones</span>
                    <span className="sm:hidden">Milestones</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator className="w-full" />

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-glass-muted" />
              <span className="text-sm font-medium text-glass">Sort:</span>
              <Select value={sortOption} onValueChange={(value: any) => setSortOption(value)}>
                <SelectTrigger className="w-32 sm:w-40 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="dependency">Dependency Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Task Content */}
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass-card rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-glass mb-4">No Tasks Found</h2>
            <p className="text-glass-muted mb-6 text-center max-w-md">
              {filterOption === 'all'
                ? "You haven't created any tasks yet. Create your first task to get started."
                : "No tasks match the current filter. Try changing the filter options."
              }
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="glass-button" onClick={handleCreateTask}>
                Add Task
              </Button>
            </motion.div>
          </div>
        ) : viewMode === 'checklist' ? (
          <div className="space-y-4">
            {sortedTasks.map((task) => {
              const goal = goals.find(g => g.id === task.goal_id);
              const project = goal ? projects.find(p => p.id === goal.project_id) : null;
              
              return (
                <motion.div
                  key={task.id}
                  className="glass-card p-4 rounded-xl glass-hover-level-1"
                  layout
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-lg font-medium text-glass">{task.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getTaskTypeColor(task.task_type)}`}>
                            {task.task_type}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Active'
                              ? 'bg-success/20 text-success'
                              : task.status === 'Not started'
                              ? 'bg-warning/20 text-warning'
                              : task.status === 'Done'
                              ? 'bg-info/20 text-info'
                              : 'bg-danger/20 text-danger'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-glass-muted text-sm">
                        {project?.name} / {goal?.name}
                      </p>
                      {task.description && (
                        <p className="text-glass text-sm">{task.description}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-glass-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time_estimate_minutes} min
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.assignee && (
                          <div>
                            Assignee: {task.assignee}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                            className="glass-button h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="glass-button text-danger hover:text-danger h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        
                        {task.status === 'Not started' && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              onClick={() => handleUpdateTaskStatus(task.id, 'Active')}
                              className="glass-button h-8 w-8 p-0"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        )}
                        
                        {task.status === 'Active' && (
                          <>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateTaskStatus(task.id, 'Not started')}
                                className="glass-button h-8 w-8 p-0"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateTaskStatus(task.id, 'Done')}
                                className="glass-button h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </>
                        )}
                        
                        {(task.status === 'Done' || task.status === 'Cancelled') && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateTaskStatus(task.id, 'Active')}
                              className="glass-button h-8 w-8 p-0"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-4 rounded-xl">
            <div className="text-center py-8">
              <p className="text-glass">Kanban view coming soon...</p>
            </div>
          </div>
        )}
      </div>
      
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={currentTask}
      />
    </>
  );
};

export default TaskView;