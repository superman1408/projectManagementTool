import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import ActivityLog from "../models/activity.js";
import { recordActivity } from "../libs/index.js";



const createProject = async (req, res) => {
  console.log("Creating the project from here");

  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }


    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner", "member"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to create project",
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

    const tagArray = tags ? tags.split(",") : [];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  console.log("Getting Project Details Here..");

  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  console.log("Getting task stated under project");
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const updateProjectStatus = async (req, res) => { 
  console.log("Now you can change the project status.");

  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldStatus = project.status;

    project.status = status;
    await project.save();

    // record activity
    await recordActivity(req.user._id, "updated_project", "Project", projectId, {
      description: `updated project status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(project);
    
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
  
};


const inviteUserToProject = async (req, res) => {
  console.log("You reached invite user to project");

  const { projectId } = req.params;
  const { email, role } = req.body;
  console.log(email);
  console.log(role);

  

  // try {
  //   const { workspaceId } = req.params;
  //   const { email, role } = req.body;

  //   const workspace = await Workspace.findById(workspaceId);

  //   if (!workspace) {
  //     return res.status(404).json({
  //       message: "Workspace not found",
  //     });
  //   }

  //   const userMemberInfo = workspace.members.find(
  //     (member) => member.user.toString() === req.user._id.toString()
  //   );

  //   // if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
  //   //   return res.status(403).json({
  //   //     message: "You are not authorized to invite members to this workspace",
  //   //   });
  //   // }

  //   // ✅ Check permission here
  //   const canInvite = authorize(
  //     userMemberInfo?.role,
  //     "workspaceRoles",
  //     "member:invite",
  //   );

  //   if (!canInvite) {
  //     return res
  //       .status(403)
  //       .json({ message: "You are not authorized to perform this action" });
  //   };

  //   const existingUser = await User.findOne({ email });

  //   if (!existingUser) {
  //     return res.status(400).json({
  //       message: "User not found",
  //     });
  //   }

  //   const isMember = workspace.members.some(
  //     (member) => member.user.toString() === existingUser._id.toString()
  //   );

  //   if (isMember) {
  //     return res.status(400).json({
  //       message: "User already a member of this workspace",
  //     });
  //   }

  //   const isInvited = await WorkspaceInvite.findOne({
  //     user: existingUser._id,
  //     workspaceId: workspaceId,
  //   });

  //   if (isInvited && isInvited.expiresAt > new Date()) {
  //     return res.status(400).json({
  //       message: "User already invited to this workspace",
  //     });
  //   }

  //   if (isInvited && isInvited.expiresAt < new Date()) {
  //     await WorkspaceInvite.deleteOne({ _id: isInvited._id });
  //   }

  //   const inviteToken = jwt.sign(
  //     {
  //       user: existingUser._id,
  //       workspaceId: workspaceId,
  //       role: role || "member",
  //     },
  //     process.env.JWT_SECRET,
  //     { expiresIn: "7d" }
  //   );

  //   await WorkspaceInvite.create({
  //     user: existingUser._id,
  //     workspaceId: workspaceId,
  //     token: inviteToken,
  //     role: role || "member",
  //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //   });

  //   const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;
  //   // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  //   const emailContent = `
  //     <p>You have been invited to join ${workspace.name} workspace</p>
  //     <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
  //   `;

  //   await sendEmail(
  //     email,
  //     "You have been invited to join a workspace",
  //     emailContent
  //   );

  //   res.status(200).json({
  //     message: "Invitation sent successfully",
  //   });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json({
  //     message: "Internal server error",
  //   });
  // }
  res.status(200).json({
    message: "Invitation Sent"
  })
};



export {
  createProject,
  getProjectDetails,
  getProjectTasks,
  updateProjectStatus,
  inviteUserToProject,
};