import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Calendar, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import ProjectModal from '@/components/projects/ProjectModal';
import { Project } from '@/types/mockData';

const ProjectView: React.FC = () => {
  const { projects, goals, tasks, isLoading, error, deleteProject, getGoalsByProjectId, getTasksByGoalId } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const handleCreateProject = () => {
    setCurrentProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated goals and tasks.')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-6 rounded-xl">
          <p className="text-glass">Loading projects...</p>
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-glass">Projects</h1>
          <Button className="glass-button" onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass-card rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-glass mb-4">Create Your First Project</h2>
            <p className="text-glass-muted mb-6 text-center max-w-md">
              Get started by creating your first project. You can add goals and tasks to organize your work.
            </p>
            <Button className="glass-button" onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectGoals = getGoalsByProjectId(project.id);
              const isExpanded = expandedProjects.has(project.id);
              
              return (
                <motion.div
                  key={project.id}
                  className="glass-card p-6 rounded-xl glass-hover"
                  layout
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleProjectExpansion(project.id)}
                            className="glass-button h-6 w-6"
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </motion.div>
                        <h3 className="text-xl font-semibold text-glass">{project.name}</h3>
                      </div>
                      <p className="text-glass-muted mt-1 ml-8">{project.description}</p>
                      
                      {project.time_estimate_months && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 ml-8 text-sm text-glass-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.time_estimate_months} months
                          </div>
                          {project.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs sm:text-sm">
                                {new Date(project.start_date).toLocaleDateString()} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'Active'
                          ? 'bg-success/20 text-success'
                          : project.status === 'Planning Phase'
                          ? 'bg-warning/20 text-warning'
                          : project.status === 'Completed'
                          ? 'bg-info/20 text-info'
                          : 'bg-danger/20 text-danger'
                      }`}>
                        {project.status}
                      </span>
                      
                      <div className="flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project)}
                            className="glass-button"
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
                            size="icon"
                            onClick={() => handleDeleteProject(project.id)}
                            className="glass-button text-danger hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Goals Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="mt-4 ml-8 space-y-3"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        {projectGoals.length === 0 ? (
                          <div className="glass-card p-4 rounded-lg">
                            <p className="text-glass-muted text-sm">No goals yet. Add your first goal to this project.</p>
                          </div>
                        ) : (
                          projectGoals.map((goal) => {
                            const goalTasks = getTasksByGoalId(goal.id);
                            const isGoalExpanded = expandedGoals.has(goal.id);
                            const completedTasks = goalTasks.filter(task => task.status === 'Done').length;
                            
                            return (
                              <motion.div
                                key={goal.id}
                                className="glass-card p-4 rounded-lg"
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => toggleGoalExpansion(goal.id)}
                                          className="glass-button h-5 w-5"
                                        >
                                          <motion.div
                                            animate={{ rotate: isGoalExpanded ? 90 : 0 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            <ChevronRight className="h-3 w-3" />
                                          </motion.div>
                                        </Button>
                                      </motion.div>
                                      <h4 className="text-lg font-medium text-glass">{goal.name}</h4>
                                    </div>
                                    <p className="text-glass-muted text-sm mt-1 ml-7">{goal.description}</p>
                                    
                                    <div className="flex items-center gap-4 mt-2 ml-7 text-sm text-glass-muted">
                                      <div className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {goal.scope}
                                      </div>
                                      {goal.due_date && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(goal.due_date).toLocaleDateString()}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        {completedTasks}/{goalTasks.length} tasks completed
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`glass-button ${
                                      goal.status === 'Active'
                                        ? 'bg-success/20 text-success border-success/30'
                                        : goal.status === 'Not started'
                                        ? 'bg-warning/20 text-warning border-warning/30'
                                        : goal.status === 'Done'
                                        ? 'bg-info/20 text-info border-info/30'
                                        : 'bg-danger/20 text-danger border-danger/30'
                                    }`}>
                                      {goal.status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {/* Tasks Section */}
                                <AnimatePresence>
                                  {isGoalExpanded && (
                                    <motion.div
                                      className="mt-3 ml-7 space-y-2"
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    >
                                      {goalTasks.length === 0 ? (
                                        <div className="glass-card p-3 rounded-lg">
                                          <p className="text-glass-muted text-sm">No tasks yet. Add your first task to this goal.</p>
                                        </div>
                                      ) : (
                                        goalTasks.map((task) => (
                                          <motion.div
                                            key={task.id}
                                            className="glass-card p-3 rounded-lg flex items-center justify-between"
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.1 }}
                                          >
                                            <div>
                                              <h5 className="text-sm font-medium text-glass">{task.name}</h5>
                                              <p className="text-xs text-glass-muted mt-1">{task.description}</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-glass-muted">{task.time_estimate_minutes} min</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                                            
                                            <div className="flex gap-1">
                                              {task.status === 'Not started' && (
                                                <Button variant="outline" size="sm" className="glass-button text-xs h-7">
                                                  Start
                                                </Button>
                                              )}
                                              {task.status === 'Active' && (
                                                <Button variant="outline" size="sm" className="glass-button text-xs h-7">
                                                  Complete
                                                </Button>
                                              )}
                                            </div>
                                          </motion.div>
                                        ))
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <ProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        project={currentProject}
      />
    </>
  );
};

export default ProjectView;