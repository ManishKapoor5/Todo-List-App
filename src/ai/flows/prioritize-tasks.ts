// prioritize-tasks.ts
'use server';
/**
 * @fileOverview AI task prioritization flow.
 *
 * This file defines a Genkit flow that uses AI to prioritize tasks based on due date, importance,
 * and user's historical task completion habits. It exports the `prioritizeTasks` function,
 * the `PrioritizeTasksInput` type, and the `PrioritizeTasksOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.array(
  z.object({
    id: z.string().describe('Unique identifier for the task.'),
    title: z.string().describe('Title of the task.'),
    dueDate: z.string().optional().describe('Due date of the task (ISO format).'),
    importance: z.enum(['high', 'medium', 'low']).describe('Importance level of the task.'),
    completed: z.boolean().describe('Whether the task is completed or not.'),
  })
).describe('Array of tasks to prioritize.');

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    id: z.string().describe('Unique identifier for the task.'),
    priorityScore: z.number().describe('AI-assigned priority score for the task.'),
    reasoning: z.string().describe('Explanation for the assigned priority score.'),
  })
).describe('Array of tasks with AI-assigned priority scores and reasoning.');

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI task prioritization expert. Analyze the following tasks and assign a priority score (0-100) to each task based on its due date, importance, and the user's task completion habits. Provide a reasoning for each assigned score.

Tasks:
{{#each this}}
- ID: {{id}}
  Title: {{title}}
  Due Date: {{dueDate}}
  Importance: {{importance}}
  Completed: {{completed}}
{{/each}}

Consider these factors when assigning priority scores:
- Tasks with earlier due dates should generally have higher priority.
- High importance tasks should have higher priority.
- Consider user's task completion habits (e.g., tasks frequently delayed should be prioritized higher).

Output should be a JSON array where each object contains the task's ID, a priorityScore, and reasoning.
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
