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
import { CreateGoal, UpdateGoal, Goal } from '@/types/mockData';
import { useApp } from '@/contexts/AppContext';

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  status: z.enum(['Not started', 'Active', 'Done', 'Cancelled']),
  scope: z.enum(['Monthly', 'Quarterly', 'Weekly-Milestone']),
  due_date: z.string().optional(),
  project_id: z.string().min(1, 'Project is required')
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  projectId?: string | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal, projectId }) => {
  const { createGoal, updateGoal, projects } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Not started',
      scope: 'Monthly',
      due_date: '',
      project_id: projectId || ''
    }
  });
  
  useEffect(() => {
    if (goal) {
      form.reset({
        name: goal.name,
        description: goal.description || '',
        status: goal.status,
        scope: goal.scope,
        due_date: goal.due_date || '',
        project_id: goal.project_id
      });
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'Not started',
        scope: 'Monthly',
        due_date: '',
        project_id: projectId || ''
      });
    }
  }, [goal, projectId, form]);
  
  const onSubmit = async (values: GoalFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (goal) {
        await updateGoal(goal.id, values as UpdateGoal);
        toast.success('Goal updated successfully!');
      } else {
        await createGoal(values as CreateGoal);
        toast.success('Goal created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      let errorMessage = 'Failed to save goal. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
        if ((error as any).details && (error as any).details.detail) {
          const details = (error as any).details.detail;
          if (Array.isArray(details) && details.length > 0) {
            const fieldErrors = details.map((d: any) => {
              if (d.loc && d.loc.length > 0) {
                const fieldName = d.loc[d.loc.length - 1];
                return `${fieldName}: ${d.msg}`;
              }
              return d.msg;
            });
            errorMessage = fieldErrors.join(', ');
          }
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal max-w-2xl max-h-[85vh] gap-1">
        <DialogHeader>
          <DialogTitle className="text-glass">
            {goal ? 'Edit Goal' : 'Create New Goal'}
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
                    <FormLabel className="text-glass">Goal Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter goal name" 
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
                        placeholder="Enter goal description" 
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
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass">Scope</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-input text-glass">
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Weekly-Milestone">Weekly-Milestone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
              
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            {isSubmitting ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;