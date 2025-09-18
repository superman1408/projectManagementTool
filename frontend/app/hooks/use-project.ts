import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import type { ProjectStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            projectData: CreateProjectFormData;
            workspaceId: string;
        }) =>
            postData(`/projects/${data.workspaceId}/create-project`, data.projectData),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["workspace", data.workspace],
            });
        },
    })
};


export const UseProjectQuery = (projectId: string) => { 
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: () => fetchData(`/projects/${projectId}/tasks`),
    });
};


export const useUpdateProjectStatusMutation = () => { 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; status: ProjectStatus }) =>
      updateData(`/projects/${data.projectId}/status`, { status: data.status }),
    onSuccess: (data: any) => {
      // Invalidate the single task
      queryClient.invalidateQueries({ queryKey: ["project", data._id] });

      // Invalidate related task activity
      queryClient.invalidateQueries({ queryKey: ["project-activity", data._id] });

      // Invalidate the parent project so its tasks re-fetch
      if (data.project) {
        queryClient.invalidateQueries({ queryKey: ["project", data.project] });
      }
    },
  });
};