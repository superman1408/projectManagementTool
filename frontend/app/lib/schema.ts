import { ProjectStatus } from "@/types";
import { z } from "zod";


export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),//z.string().email() but this typescript code is deprecated so z.email("invalid email address") can be used instead.
    password: z.string().min(6, "Password is required."),//z.string().min(8) this can be set so that new user need to create password with min of 8 characters but policy can change so we have removed it and decide it at deployment stage.
});


export const signUpSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be 8 characters."),
    confirmPassword: z.string().min(8, "Password must be 8 characters."),
}).refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    error: "Password do not match",//message: "Password do not match." but this "message" is deprecated.
});


export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});


export const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be 8 characters."),
    confirmPassword: z.string().min(8, "Password must be 8 characters.")
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Password do not match",
});


export const workspaceSchema = z.object({
    name: z.string().min(3, "name must be at least 3 characters"),
    color: z.string().min(3, "Color must be at least 3 characters"),
    description: z.string().optional(),
});


export const projectSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    status: z.nativeEnum(ProjectStatus),//@deprecated This API has been merged into z.enum(). Use z.enum() instead.
    startDate: z.string().min(10, "Start date is required"),
    dueDate: z.string().min(10, "Due date is required"),
    members: z.array(
        z.object({
            user: z.string(),
            role: z.enum(["manager", "contributor", "viewer"]),
        })
    ).optional(),
    tags: z.string().optional(),
});


export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});
