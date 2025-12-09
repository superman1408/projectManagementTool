import express from "express";
import authMiddleware  from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import {
  projectSchema,
  tokenSchema,
  inviteMemberProjectSchema,
} from "../libs/validate-schema.js";
import { z } from "zod";
import {
  createProject,
  getProjectDetails,
  getProjectTasks,
  updateProjectStatus,
  inviteUserToProject,
  acceptProjectInviteByToken,
} from "../controllers/project.js";


const router = express.Router();


router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
    body: projectSchema,
  }),
  createProject
);


router.put(
  "/:projectId/status",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
    body: z.object({ status: z.string() }),
  }),
  updateProjectStatus
);


router.get(
  "/:projectId",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string()})
  }),
  getProjectDetails
);



router.get(
  "/:projectId/tasks",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  getProjectTasks
);


router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptProjectInviteByToken
);


router.post(
  "/:projectId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
    body: inviteMemberProjectSchema,
  }),
  inviteUserToProject
);




export default router;