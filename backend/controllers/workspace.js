import Workspace from "../models/workspace.js";
import Project from "../models/project.js";



const createWorkspace = async (req, res) => { 
    console.log("Create Workspace is working here");

    try {
        const { name, description, color } = req.body;
        
        const workspace = await Workspace.create({
            name,
            description,
            color,
            owner: req.user._id,
            members: [
                {
                    user: req.user._id,
                    role: "owner",
                    joinedAt: new Date(),
                },
            ],
        });

        res.status(201).json(workspace);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
    
};


const getWorkspaces = async (req, res) => { 
    console.log("get Workspace is working");

    try {
        const workspaces = await Workspace.find({
            "members.user": req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json(workspaces);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
        
    }
};


const getWorkspaceDetails = async (req, res) => {
  
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user._id,
        }).populate(
            "members.user",
            "name email profilePicture"
        );

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }



        res.status(200).json(workspace);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
        
    }
};


const getWorkspaceProjects = async (req, res) => { 
    console.log("Get Workspace Projects");

    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user._id,
        }).populate("members.user", "name email profilePicture");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false,
            // members: { $in: [req.user._id] }
        })
            // .populate("task", "status")
            .sort({ createdAt: -1 });


        res.status(200).json({ projects, workspace });
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
        });
        
    }
    
};


const getProjectDetails = async (req, res) => { };


// const getWorkspaceStats = async (req, res) => {
//     console.log("you triggered workspace statistics");

//     try {
//       const { workspaceId } = req.params;

//       const workspace = await Workspace.findOne(workspaceId);

//       if (!workspace) {
//         return res.status(404).json({
//           message: "Workspace not found",
//         });
//       }

//       const isMember = workspace.members.some(
//         (member) => member.user.toString() === req.user._id.toString()
//       );

//       if (!isMember) {
//         return res.status(403).json({
//           message: "You are not a member of this workspace",
//         });
//       }

//       // const totalProjects = await Project.countDocuments({
//       //     workspace: workspaceId,
//       // });

//       const [totalProjects, projects] = await Promise.all([
//         Project.countDocuments({ workspace: workspaceId }),
//         Project.find({ workspace: workspaceId })
//           .populate(
//             "tasks",
//             "title status dueDate project updatedAt isArchived priority"
//           )
//           .sort({ createdAt: -1 }),
//       ]);

//       const totalTasks = projects.reduce((acc, project) => {
//         return acc + project.tasks.length;
//       });

//       const totalProjectInProgress = projects.filter(
//         (project) => project.status === "In Progress"
//       );
//       const totalProjectCompleted = projects.filter(
//         (project) => project.status === "Completed"
//       );

//       const totalTaskCompleted = projects.reduce((acc, project) => {
//         return (
//           acc + project.tasks.filter((task) => task.status === "Done").length
//         );
//       }, 0);

//       const totalTaskToDo = projects.reduce((acc, project) => {
//         return (
//           acc + project.tasks.filter((task) => task.status === "To Do").length
//         );
//       }, 0);

//       const totalTaskInProgress = projects.reduce((acc, project) => {
//         return (
//           acc +
//           project.tasks.filter((task) => task.status === "In Progress").length
//         );
//       }, 0);

//       const tasks = projects.flatMap((project) => project.tasks);

//       // Get upcoming task in next 7 days

//       const upcomingTasks = tasks.filter((task) => {
//         const taskDate = new Date(task.dueDate);
//         const today = new Date();

//         return (
//           taskDate > today &&
//           taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
//         );
//       });

//       const taskTrendsData = [
//         { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
//         { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
//         { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
//         { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
//         { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
//         { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
//         { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
//       ];

//       // Get last 7 days tasks date
//       const last7Days = Array.from({ length: 7 }, (_, i) => {
//         const date = new Date();
//         date.setDate(today.getDate() - i);
//         return date;
//       }).reverse();

//       //populate

//       for (const project of projects) {
//         for (const task in project.tasks) {
//           const taskDate = new Date(task.updatedAt);

//           const dayInDate = last7Days.findIndex(
//             (date) =>
//               date.getDate() === taskDate.getDate() &&
//               date.getMonth() === taskDate.getMonth() &&
//               date.getFullYear() === taskDate.getFullYear()
//           );

//           if (dayInDate !== -1) {
//             const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
//               weekday: "short",
//             });

//             const dayData = taskTrendsData.find((day) => day.name === dayName);

//             if (dayData) {
//               switch (task.status) {
//                 case "Done":
//                   dayData.completed++;
//                   break;
//                 case "In Progress":
//                   dayData.inProgress++;
//                   break;
//                 case "To Do":
//                   dayData.toDo++;
//                   break;
//               }
//             }
//           }
//         }
//       }

//       // get project status distribution
//       const projectStatusData = [
//         { name: "Completed", value: 0, color: "#10b981" },
//         { name: "In Progress", value: 0, color: "#3b82f6" },
//         { name: "Planning", value: 0, color: "#f59e0b" },
//       ];

//       for (const project of projects) {
//         switch (project.status) {
//           case "Completed":
//             projectStatusData[0].value++;
//             break;
//           case "In Progress":
//             projectStatusData[1].value++;
//             break;
//           case "Planning":
//             projectStatusData[2].value++;
//             break;
//         }
//       }

//         // Task priority distribution
//         const taskPriorityData = [
//             { name: "High", value: 0, color: "#ef4444" },
//             { name: "Medium", value: 0, color: "#f59e0b" },
//             { name: "Low", value: 0, color: "#6b7280" },
//         ];


//         for (const task of tasks) {
//             switch (task.priority) {
//                 case "High":
//                     taskPriorityData[0].value++;
//                     break;
//                 case "Medium":
//                     taskPriorityData[1].value++;
//                     break;
//                 case "Low":
//                     taskPriorityData[2].value++;
//                     break;
//             }
//         }

//         const workspaceProductivityData = [];

//         for (const project of projects) {
//             const projectTask = tasks.filter(
//                 (task) => task.project.toString() === project._id.toString()
//             );

//             const completedTask = projectTask.filter(
//                 (task) => task.status === "Done" && task.isArchived === false
//             );

//             workspaceProductivityData.push({
//                 name: project.title,
//                 completed: completedTask.length,
//                 total: projectTask.length,
//             });
//         }


//         const stats = {
//             totalProjects,
//             totalTasks,
//             totalProjectInProgress,
//             totalTaskCompleted,
//             totalTaskToDo,
//             totalTaskInProgress,
//         };

//         res.status(200).json({
//             stats,
//             taskTrendsData,
//             projectStatusData,
//             taskPriorityData,
//             workspaceProductivityData,
//             upcomingTasks,
//             recentProjects: projects.slice(0, 5),
//         });
        

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Internal server error",
//         });
        
//     }
    
// };


const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;
    // const totalProjectCompleted = projects.filter(
    //   (project) => project.status === "Completed"
    // ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // get upcoming task in next 7 days

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);//error was here
      return date;
    }).reverse();

    // populate

    for (const project of projects) {
      for (const task in project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};



export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getProjectDetails,
  getWorkspaceStats,
};