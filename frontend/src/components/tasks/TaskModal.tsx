import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CreateTask, UpdateTask, Task, Goal, Project } from '@/types/mockData';
import { useApp } from '@/contexts/AppContext';
import { useCreateTask, useUpdateTask, useGoals, useProjects } from '@/hooks/useQueries';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  status: z.enum(['Not started', 'Active', 'Done', 'Cancelled']),
  task_type: z.enum(['Network', 'Debug', 'Review', 'Develop', 'Marketing', 'Provision', 'Research']),
  priority: z.enum(['Low', 'Medium', 'High']),
  effort_level: z.enum(['Small', 'Medium', 'Large']),
  time_estimate_minutes: z.number().min(1, 'Time estimate is required'),
  due_date: z.string().optional(),
  goal_id: z.string().min(1, 'Goal is required')
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  goalId?: string | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, goalId }) => {
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const { data: goals } = useGoals();
  const { data: projects } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Not started',
      task_type: 'Develop',
      priority: 'Medium',
      effort_level: 'Medium',
      time_estimate_minutes: 60,
      due_date: '',
      goal_id: goalId || ''
    }
  });
  
  useEffect(() => {
    if (goals && projects) {
      // Get unique projects from goals
      const uniqueProjects = Array.from(
        new Set(goals.map(goal => goal.project_id))
      ).map(projectId => {
        return projects.find(p => p.id === projectId);
      }).filter(Boolean) as Project[];
      
      if (uniqueProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(uniqueProjects[0].id);
      }
      
      // Filter goals based on selected project
      if (selectedProjectId) {
        const projectGoals = goals.filter(goal => goal.project_id === selectedProjectId);
        setFilteredGoals(projectGoals);
      }
    }
  }, [goals, projects, selectedProjectId]);
  
  useEffect(() => {
    if (task && goals) {
      const goal = goals.find(g => g.id === task.goal_id);
      if (goal) {
        setSelectedProjectId(goal.project_id);
      }
      
      form.reset({
        name: task.name,
        description: task.description || '',
        status: task.status,
        task_type: task.task_type,
        priority: task.priority,
        effort_level: task.effort_level,
        time_estimate_minutes: task.time_estimate_minutes,
        due_date: task.due_date || '',
        goal_id: task.goal_id
      });
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'Not started',
        task_type: 'Develop',
        priority: 'Medium',
        effort_level: 'Medium',
        time_estimate_minutes: 60,
        due_date: '',
        goal_id: goalId || ''
      });
    }
  }, [task, goalId, goals, form]);
  
  const onSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (task) {
        await updateTaskMutation.mutateAsync({ id: task.id, updates: values as UpdateTask });
      } else {
        await createTaskMutation.mutateAsync(values as CreateTask);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (goals) {
      const projectGoals = goals.filter(goal => goal.project_id === projectId);
      setFilteredGoals(projectGoals);
      
      // Reset goal selection
      form.setValue('goal_id', projectGoals.length > 0 ? projectGoals[0].id : '');
    }
  };
  
  // Get unique projects from goals
  const uniqueProjects = goals && projects ? Array.from(
    new Set(goals.map(goal => goal.project_id))
  ).map(projectId => {
    return projects.find(p => p.id === projectId);
  }).filter(Boolean) as Project[] : [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal max-w-2xl max-h-[85vh] gap-1">
        <DialogHeader>
          <DialogTitle className="text-glass">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(75vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-glass">Task Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task name" 
                      className="glass-input text-glass"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-glass">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description" 
                      className="glass-input text-glass min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Not started">Not started</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="task_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Task Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Network">Network</SelectItem>
                        <SelectItem value="Debug">Debug</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Develop">Develop</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Provision">Provision</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="effort_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Effort Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select effort" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time_estimate_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Time Estimate (Minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 60" 
                        className="glass-input text-glass"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="glass-input text-glass"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Project and Goal Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-glass">Project</FormLabel>
                <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                  <SelectTrigger className="glass-input text-glass mt-2">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <FormField
                control={form.control}
                name="goal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={filteredGoals.length === 0}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredGoals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            </form>
          </Form>
        </ScrollArea>
        
        {error && (
          <div className="pt-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="glass-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="glass-button text-glass"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;