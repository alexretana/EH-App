import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  projectApi, 
  goalApi, 
  taskApi, 
  knowledgeApi 
} from '@/data/api/realApi';
import { 
  UpdateProject,
  UpdateGoal,
  UpdateTask,
  UpdateKnowledgeBase
} from '@/types/mockData';
import { toast } from 'sonner';

// Project Queries
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAll,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
    },
    onError: (error: any) => {
      console.error('Create project error:', error);
      let errorMessage = 'Failed to create project. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateProject }) => 
      projectApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update project error:', error);
      let errorMessage = 'Failed to update project. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Project deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project. Please try again.');
    },
  });
};

// Goal Queries
export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: goalApi.getAll,
  });
};

export const useGoalsByProjectId = (projectId: string) => {
  return useQuery({
    queryKey: ['goals', { projectId }],
    queryFn: () => goalApi.getByProjectId(projectId),
    enabled: !!projectId,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: goalApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully!');
    },
    onError: (error: any) => {
      console.error('Create goal error:', error);
      let errorMessage = 'Failed to create goal. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateGoal }) => 
      goalApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update goal error:', error);
      let errorMessage = 'Failed to update goal. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: goalApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Goal deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete goal error:', error);
      toast.error('Failed to delete goal. Please try again.');
    },
  });
};

// Task Queries
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getAll,
  });
};

export const useTasksByGoalId = (goalId: string) => {
  return useQuery({
    queryKey: ['tasks', { goalId }],
    queryFn: () => taskApi.getByGoalId(goalId),
    enabled: !!goalId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      console.error('Create task error:', error);
      let errorMessage = 'Failed to create task. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTask }) => 
      taskApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update task error:', error);
      let errorMessage = 'Failed to update task. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task. Please try again.');
    },
  });
};

// Knowledge Base Queries
export const useKnowledgeBase = () => {
  return useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: knowledgeApi.getAll,
  });
};

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: knowledgeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      toast.success('Knowledge base item created successfully!');
    },
    onError: (error: any) => {
      console.error('Create knowledge base error:', error);
      let errorMessage = 'Failed to create knowledge base item. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateKnowledgeBase }) => 
      knowledgeApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      toast.success('Knowledge base item updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update knowledge base error:', error);
      let errorMessage = 'Failed to update knowledge base item. Please try again.';
      if (error.details && error.details.detail) {
        const details = error.details.detail;
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
      toast.error(errorMessage);
    },
  });
};

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: knowledgeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      toast.success('Knowledge base item deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete knowledge base error:', error);
      toast.error('Failed to delete knowledge base item. Please try again.');
    },
  });
};