import type { Route } from "../../../+types/root";
import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { InviteMemberProjectDialog } from "@/components/project/invite-member-project";
import { ProjectStatusSelector } from "@/components/project/project-status-selector";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { SCurve } from "@/components/project/s-curve";
import { CurveRough } from "@/components/project/curve-Rough";
import { TaskCard } from "@/components/task/task-card";
import { TaskCardOld } from "@/components/task/task-card-old";
import { TableDemo } from "@/components/task/table-demo";
import { Link } from "react-router";



import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "PMT- Project" },
    { name: "description", content: "Welcome Ashkam Energy Pvt Ltd!" },
  ];
}


const ProjectDetails = () => {
    const { projectId, workspaceId } = useParams<{
        projectId: string;
        workspaceId: string;
    }>();
    const navigate = useNavigate();

    const [isCreateTask, setIsCreateTask] = useState(false);
    const [isInviteMember, setIsInviteMember] = useState(false);
    
    const { mutate, isPending } = useUpdateTaskStatusMutation();


    const { data, isLoading } = UseProjectQuery(projectId!) as {
        data: {
            tasks: Task[];
            project: Project;
        };
        isLoading: boolean;
    };
  

    if (isLoading) {
        return (
            <div>
                <Loader />
            </div>
        );
    };
        
  
  
  
  // if (!data || !workspaceId) return <div>Please select your Workspace</div>;

    if (!projectId || !data) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                <div className="rounded-xl bg-gray-100 px-6 py-4 shadow-sm">
                    <p className="text-lg font-medium text-gray-700">
                        Project not found
                    </p>
                    <p className="text-sm text-gray-500">
                        The project you are looking for does not include you or does not exist or has been removed. Please check the URL or contact the project administrator.
                    </p>
                </div>
            </div>
        );
    }


    const { project, tasks } = data;
    const projectProgress = getProjectProgress(tasks);

    const handleTaskClick = (taskId: string) => {
        navigate(
            `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
        );
    };
    

  
  
  

    const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
        mutate(
            { taskId , status },
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



    const sortByStartDate = (taskList: Task[]) => {
        return [...taskList].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
    };


    const sortByDueDate = (taskList: Task[]) => {
        return [...taskList].sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
    };


    //   const sortedTask = tasks.reverse();
    const sortedTask = [...tasks].reverse();
    // const sortedTask = [...tasks].sort(
    //     (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    // );

    // const sortedTask = [...tasks]
    //     .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // const sortedTask = [...tasks].sort(
    //     (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    // );




  



  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
            <ProjectStatusSelector status={ project.status } projectId={project._id} />
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">
              {projectProgress}%
            </span>
          </div>

          <Button variant={"outline"} onClick={() => setIsInviteMember(true)}>
            <UserPlus className="size-4 mr-2" />
                        Invite
          </Button>
          <Button onClick={() => setIsCreateTask(true)}>Add Task</Button>
        </div>
      </div>
{/* -----------------S Curve for monitoring the project---------------------------------------- */}
      <div>
        <SCurve project={project} />
      </div>
{/* ----------------------Task Table here-------------------------------------------------------- */}
        <div>
            <Table>
                <TableCaption>A list of your Tasks in {project.title} project.</TableCaption>
                <TableHeader>
                    <TableRow className="bg-slate-300">
                        <TableHead className=" text-black text-l font-extrabold">Task Priority</TableHead>
                        <TableHead className="w-[100px] text-black text-l font-extrabold">Task Title</TableHead>
                        <TableHead className=" text-black text-l text-center font-extrabold">Sub Tasks</TableHead>
                        <TableHead className=" text-black text-l font-extrabold">Status</TableHead>
                        <TableHead className=" text-black text-l font-extrabold">Start Date</TableHead>
                        <TableHead className=" text-black text-l font-extrabold">Due Date</TableHead>
                        <TableHead className=" text-black text-l font-extrabold">Assigned</TableHead>
                        <TableHead className=" text-black text-l font-extrabold">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTask.map((s) => (
                        <TableRow key={s._id}>
                            <TableCell className="text-center">
                                <Badge
                                    className={
                                    s.priority === "High"
                                        ? "bg-red-500 text-white"
                                        : s.priority === "Medium"
                                        ? "bg-orange-500 text-white"
                                        : "bg-slate-500 text-white"
                                    }
                                >
                                    {s.priority}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                                <Link
                                    to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${s._id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {s.title}
                                </Link>
                            </TableCell>
                            <TableCell className="text-center">
                                {
                                    s.subtasks && s.subtasks.length > 0 && (
                                        <span>
                                            {s.subtasks.filter((p) => p.completed).length}/{s.subtasks.length}
                                        </span>
                                    )
                                }
                            </TableCell>
                            <TableCell className={
                                    s.status === "To Do"
                                        ? "bg-slate-500 text-white font-medium"
                                        : s.status === "In Progress"
                                            ? "bg-amber-400 text-white font-medium"
                                            : "bg-green-600 text-white font-medium"
                                }>
                                    {s.status}
                            </TableCell>
                            <TableCell className="font-medium">{s.startDate ? format(new Date(s.startDate), "dd/MM/yyyy") : "--"}</TableCell>
                            <TableCell className="font-medium">{s.dueDate ? format(new Date(s.dueDate), "dd/MM/yyyy") : "--"}</TableCell>
                            <TableCell className="font-medium">
                                {
                                    s.assignees && s.assignees.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {s.assignees.slice(0, 5).map((member) => (
                                            <Avatar
                                                key={member._id}
                                                className="size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden"
                                                title={member.name}
                                            >
                                                <AvatarImage src={member.profilePicture} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            ))}
                                            {s.assignees.length > 5 && (
                                            <span className="text-xs text-muted-foreground">
                                                + {s.assignees.length - 5}
                                            </span>
                                            )}
                                        </div>
                                    )
                                }
                            </TableCell>
                            <TableCell className="font-medium">
                                {
                                    <div className="flex gap-1">
                                        {s.status !== "To Do" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6"
                                                onClick={() => handleUpdateStatus(s._id, "To Do")}
                                                title="Mark as To Do"
                                                disabled={isPending}
                                            >
                                                <AlertCircle className={cn("size-4")} />
                                            </Button>
                                        )}

                                        {s.status !== "In Progress" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6"
                                                onClick={() => handleUpdateStatus(s._id, "In Progress")}
                                                title="Mark as In Progress"
                                                disabled={isPending}
                                            >
                                                <Clock className={cn("size-4")} />
                                            </Button>
                                        )}

                                        {s.status !== "Done" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6"
                                                onClick={() => handleUpdateStatus(s._id, "Done")}
                                                title="Mark as Done"
                                                disabled={isPending}
                                            >
                                                <CheckCircle className={cn("size-4")} />
                                            </Button>
                                        )}
                                    </div>
                                }
                            </TableCell>
                            {/* <TableCell>{invoice.paymentMethod}</TableCell> */}
                            {/* <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
                        </TableRow>
                    ))}
                </TableBody>
                {/* <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter> */}
            </Table>
        </div>

      {/* create    task dialog */}
        <CreateTaskDialog
            open={isCreateTask}
            onOpenChange={setIsCreateTask}
            projectId={projectId!}
            projectMembers={project.members as any}
        />

        <InviteMemberProjectDialog
            isOpen={isInviteMember}
            onOpenChange={setIsInviteMember}
            projectId={projectId}
        />
    </div>
  );
};

export default ProjectDetails;

