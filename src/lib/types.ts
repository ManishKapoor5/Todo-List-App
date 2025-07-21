import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(100, "Title is too long."),
  dueDate: z.date().optional(),
  importance: z.enum(['low', 'medium', 'high']),
});

export const taskSchema = taskFormSchema.extend({
  id: z.string(),
  completed: z.boolean(),
  priorityScore: z.number().optional(),
  reasoning: z.string().optional(),
});

export type Task = z.infer<typeof taskSchema>;
