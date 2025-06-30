"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import membershipService from '../services/membershipService';

// Project queries
export function useProject(projectId) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: !!projectId,
  });
}

// Tasks queries
export function useProjectTasks(projectId) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getProjectTasks(projectId),
    enabled: !!projectId,
  });
}

// Members queries
export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: () => membershipService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

// Task mutations
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData) => taskService.createTask(taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tasks', variables.projectId]);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData) => taskService.updateTask(taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tasks', variables.projectId]);
    },
  });
}

// Project mutations
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData) => projectService.updateProject(projectData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['project', variables.id]);
    },
  });
} 