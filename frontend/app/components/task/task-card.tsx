import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";






export const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {

  const { mutate, isPending } = useUpdateTaskStatusMutation();
  
  

  const handleUpdateStatus = (status: TaskStatus) => {
    mutate(
      { taskId: task._id, status },
      {
        onSuccess: () => {
          toast.success(`Marked as ${status}`);
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "Failed to update status";
          toast.error(errorMessage);
          console.error(error);
        },
      }
    );
  };


  
  return (
    <div onClick={onClick}  className="cursor-pointer bg-gray-100 hover:bg-gray-50 transition-all border border-black rounded 
             grid grid-cols-7 justify-between px-2 py-2">
      {/* Priority */}
      <td className="p-2">
        <Badge
          className={
            task.priority === "High"
              ? "bg-red-500 text-white"
              : task.priority === "Medium"
              ? "bg-orange-500 text-white"
              : "bg-slate-500 text-white"
          }
        >
          {task.priority}
        </Badge>
      </td>

      {/* Title + Description */}
      <td className="flex flex-col p-2">
        <div className="font-medium">{task.title}</div>
        {task.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </div>
        )}
      </td>

      {/* Assignees */}
      <td className="p-2">
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 5).map((member) => (
              <Avatar
                key={member._id}
                className="size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden"
                title={member.name}
              >
                <AvatarImage src={member.profilePicture} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {task.assignees.length > 5 && (
              <span className="text-xs text-muted-foreground">
                + {task.assignees.length - 5}
              </span>
            )}
          </div>
        )}
      </td>

      {/* Start Date */}
      <td className="p-2 text-xs text-muted-foreground">
        {task.startDate && (
          <div className="flex items-center">
            <Calendar className="size-3 mr-1" />
            {format(new Date(task.startDate), "MMM d, yyyy")}
          </div>
        )}
      </td>

      {/* Due Date */}
      <td className="p-2 text-xs text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar className="size-3 mr-1" />
            {format(new Date(task.dueDate), "MMM d, yyyy")}
          </div>
        )}
      </td>


      {/* Subtasks */}
      <td className="p-2 text-xs text-muted-foreground">
        {task.subtasks && task.subtasks.length > 0 && (
          <span>
            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
          </span>
        )}
      </td>

      {/* Status update buttons */}
      <td className="p-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1">
          {task.status !== "To Do" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => handleUpdateStatus("To Do")}
              title="Mark as To Do"
              disabled={isPending}
            >
              <AlertCircle className={cn("size-4")} />
            </Button>
          )}

          {task.status !== "In Progress" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => handleUpdateStatus("In Progress")}
              title="Mark as In Progress"
              disabled={isPending}
            >
              <Clock className={cn("size-4")} />
            </Button>
          )}

          {task.status !== "Done" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => handleUpdateStatus("Done")}
              title="Mark as Done"
              disabled={isPending}
            >
              <CheckCircle className={cn("size-4")} />
            </Button>
          )}
        </div>
      </td>
    </div>
  );
};
