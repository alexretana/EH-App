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
import { TaskDataTable } from '@/components/tasks/TaskDataTable';
import { Task } from '@/types/mockData';

const TaskView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
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


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-glass">Tasks</h1>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="glass-button text-[var(--text)]" onClick={handleCreateTask}>
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
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="glass-button"
                  >
                    <List className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Table</span>
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
              <Button className="glass-button text-[var(--text)]" onClick={handleCreateTask}>
                Add Task
              </Button>
            </motion.div>
          </div>
        ) : viewMode === 'table' ? (
          <TaskDataTable
            tasks={sortedTasks}
            goals={goals}
            projects={projects}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
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