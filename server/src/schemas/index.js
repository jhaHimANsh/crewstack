const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER')
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password required')
});

const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().trim().max(1000).optional().default(''),
  memberIds: z.array(z.string()).optional().default([])
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional()
});

const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email required')
});

const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().max(2000).optional().default(''),
  projectId: z.string().min(1, 'projectId required'),
  assigneeId: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z
    .union([z.string().datetime(), z.string().date(), z.null()])
    .optional()
    .transform((v) => (v ? new Date(v) : null))
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  assigneeId: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z
    .union([z.string().datetime(), z.string().date(), z.null()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? new Date(v) : null))
});

module.exports = {
  signupSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  createTaskSchema,
  updateTaskSchema
};
