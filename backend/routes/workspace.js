import express from "express";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

import { workspaceSchema } from "../libs/validate-schema.js";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getProjectDetails,
  getWorkspaceStats,
} from "../controllers/workspace.js";
import authMiddleware from "../middleware/auth-middleware.js";


const router = express.Router();


router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);


router.get("/", authMiddleware, getWorkspaces);

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);

router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);

router.get("/:workspaceId/projects/:projectId", authMiddleware, getProjectDetails);


router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);


export default router;