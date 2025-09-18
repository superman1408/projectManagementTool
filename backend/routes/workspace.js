import express from "express";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

import {
  workspaceSchema,
  tokenSchema,
  inviteMemberSchema,
} from "../libs/validate-schema.js";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getProjectDetails,
  getWorkspaceStats,
  acceptInviteByToken,
  inviteUserToWorkspace,
  acceptGenerateInvite,
} from "../controllers/workspace.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);

router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

router.get("/", authMiddleware, getWorkspaces);

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);

router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);

router.get(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  getProjectDetails
);

router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

export default router;