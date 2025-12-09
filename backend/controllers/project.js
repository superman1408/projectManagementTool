import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import ActivityLog from "../models/activity.js";
import { recordActivity } from "../libs/index.js";
import User from "../models/user.js";
import { authorize } from "../config/config.js";
import ProjectInvite from "../models/project-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";



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

  try {
    const { projectId } = req.params;
    const { email, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspaceId = project.workspace;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    

    // ✅ Check permission here
    const canInvite = authorize(
      userMemberInfo?.role,
      "projectRoles",
      "member:invite"
    );

    
    if (!canInvite) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    const invitedUser = await User.findOne({ email });

    if (!invitedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === invitedUser._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Invited user is not a member of this workspace",
      });
    }

    const isAlreadyProjectMember = await Project.findById(invitedUser);

    if (isAlreadyProjectMember) {
      return res.status(409).json({
        message: "Invited user is already added as member in the project",
      });
    }


    const isInvited = await ProjectInvite.findOne({
      user: invitedUser._id,
      projectId: projectId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "User already invited to this workspace",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await ProjectInvite.deleteOne({ _id: isInvited._id });
    }


    const inviteToken = jwt.sign(
      {
        user: invitedUser._id,
        workspaceId: workspaceId,
        projectId: projectId,
        role: role || "contributor",
      },
        process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    await ProjectInvite.create({
      user: invitedUser._id,
      workspaceId: workspaceId,
      projectId: projectId,
      token: inviteToken,
      role: role || "contributor",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/project-invite/${project._id}?tk=${inviteToken}`;

    const emailContent = `
      <p>You have been invited to join ${project.title} project</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    await sendEmail(
      email,
      "You have been added to the project",
      emailContent
    );

    res.status(200).json({
      message: "Invitation to join the project team sent successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server Error",
    });
  }
};


const acceptInviteByToken = async (req, res) => {
  console.log("You reached accept invite in project by token");

  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId,projectId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const inviteInfo = await ProjectInvite.findOne({
      user,
      projectId,
    });

    if (!inviteInfo) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invitation has expired" });
    }

    // ✅ Atomic add (prevents duplicates)
    const updatedWorkspace = await Project.findOneAndUpdate(
      { _id: projectId, "members.user": { $ne: user } },
      {
        $addToSet: {
          members: {
            user,
            role: role || "contributor",
            joinedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedWorkspace) {
      return res.status(400).json({
        message: "User is already a member of this project",
      });
    }

    await Promise.all([
      ProjectInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "joined_project", "Project", "Project", projectId, {
        description: `Joined ${project.name} project`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


const acceptProjectInviteByToken = async (req, res) => { 
  console.log("You reached accept request by token in project section");

  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, projectId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const inviteInfo = await ProjectInvite.findOne({
      user,
      projectId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found.",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(410).json({
        message: "Invitation expired",
      });
    }


    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, "members.user": { $ne: user } },
      {
        $addToSet: {
          members: {
            user,
            role: role || "contributor",
            joinedAt: new Date(),
          },
        },
      },
      { new: true }
    );


    if (!updatedProject) {
      return res.status(409).json({
        message: "User is already member of the project team",
      });
    }


    await Promise.all([
      ProjectInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(
        user,
        "joined_project",
        "Project",
        projectId,
        {
          description: `Joined ${project.title} project team`,
        }
      ),
    ]);

    console.log("Done here");
    

    res.status(200).json({
      message: "Invitation accepted successfully."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
  
};


export {
  createProject,
  getProjectDetails,
  getProjectTasks,
  updateProjectStatus,
  inviteUserToProject,
  acceptProjectInviteByToken,
};



// Alternatives (less ideal)

// 400 Bad Request — generic, not recommended if you want clarity.

// 403 Forbidden — incorrect, because the user isn’t forbidden; the link is just expired.

// 404 Not Found — misleading, because the invite exists but is expired.

// 👉 410 Gone is the correct semantic choice for expired or invalidated invitations.