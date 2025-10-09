import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CreateProject, UpdateProject, Project } from '@/types/mockData';
import { useApp } from '@/contexts/AppContext';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Planning Phase', 'Active', 'Completed', 'Cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean(),
  is_validated: z.boolean(),
  time_estimate_months: z.number().optional(),
  time_estimation_validated: z.boolean(),
  expansion_horizon: z.enum(['1 Week', '2 Weeks', '3 Weeks']).optional(),
  milestone_granularity: z.enum(['Monthly', 'Quarterly', 'Monthly&Quarterly']).optional()
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const { createProject, updateProject } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Planning Phase',
      start_date: '',
      end_date: '',
      is_active: false,
      is_validated: false,
      time_estimate_months: undefined,
      time_estimation_validated: false,
      expansion_horizon: '2 Weeks',
      milestone_granularity: 'Monthly'
    }
  });
  
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        is_active: project.is_active,
        is_validated: project.is_validated,
        time_estimate_months: project.time_estimate_months || undefined,
        time_estimation_validated: project.time_estimation_validated,
        expansion_horizon: project.expansion_horizon,
        milestone_granularity: project.milestone_granularity
      });
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'Planning Phase',
        start_date: '',
        end_date: '',
        is_active: false,
        is_validated: false,
        time_estimate_months: undefined,
        time_estimation_validated: false,
        expansion_horizon: '2 Weeks',
        milestone_granularity: 'Monthly'
      });
    }
  }, [project, form]);
  
  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (project) {
        await updateProject(project.id, values as UpdateProject);
        toast.success('Project updated successfully!');
      } else {
        await createProject(values as CreateProject);
        toast.success('Project created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      // Extract user-friendly error message
      let errorMessage = 'Failed to save project. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Try to extract more specific error details from API response
        if ((error as any).details && (error as any).details.detail) {
          const details = (error as any).details.detail;
          if (Array.isArray(details) && details.length > 0) {
            // Extract field-specific errors
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
            {project ? 'Edit Project' : 'Create New Project'}
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
                  <FormLabel className="text-glass">Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project name" 
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
                      placeholder="Enter project description" 
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
                        <SelectItem value="Planning Phase">Planning Phase</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time_estimate_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Time Estimate (Months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 3" 
                        className="glass-input text-glass"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Start Date</FormLabel>
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
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">End Date</FormLabel>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expansion_horizon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Expansion Horizon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select horizon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 Week">1 Week</SelectItem>
                        <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                        <SelectItem value="3 Weeks">3 Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="milestone_granularity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Milestone Granularity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input text-glass">
                          <SelectValue placeholder="Select granularity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Monthly&Quarterly">Monthly & Quarterly</SelectItem>
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 glass-card">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-glass">Active Project</FormLabel>
                      <p className="text-sm text-glass-muted">
                        Mark this project as currently active
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_validated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 glass-card">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-glass">Validated</FormLabel>
                      <p className="text-sm text-glass-muted">
                        Project details have been validated
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="time_estimation_validated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 glass-card">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-glass">Time Estimation Validated</FormLabel>
                    <p className="text-sm text-glass-muted">
                      Time estimates have been validated
                    </p>
                  </div>
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
            {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;