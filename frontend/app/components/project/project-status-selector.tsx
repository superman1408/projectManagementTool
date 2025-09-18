import type { ProjectStatus, TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { useUpdateProjectStatusMutation } from "@/hooks/use-project";

export const ProjectStatusSelector = ({
  status,
  projectId,
}: {
  status: ProjectStatus;
  projectId: string;
}) => {
    const { mutate, isPending } = useUpdateProjectStatusMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { projectId, status: value as ProjectStatus },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
    };
    
    
  return (
    <Select value={status || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Completed">Completed</SelectItem>
        <SelectItem value="Cancelled">Cancelled</SelectItem>
        <SelectItem value="On Hold">On Hold</SelectItem>
        <SelectItem value="Planning">Planning</SelectItem>
      </SelectContent>
    </Select>
  );
};