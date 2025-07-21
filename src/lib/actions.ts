'use server'

import { prioritizeTasks as runPrioritizeTasksFlow, type PrioritizeTasksInput, type PrioritizeTasksOutput } from '@/ai/flows/prioritize-tasks';

export async function prioritizeTasks(tasks: PrioritizeTasksInput): Promise<{ success: boolean; data?: PrioritizeTasksOutput; error?: string; }> {
  if (tasks.length === 0) {
    return { success: false, error: "No tasks to prioritize." };
  }
  
  try {
    const prioritized = await runPrioritizeTasksFlow(tasks);
    return { success: true, data: prioritized };
  } catch (error) {
    console.error("AI prioritization failed:", error);
    // In a real app, you might want to log this error to a monitoring service
    return { success: false, error: "Failed to prioritize tasks using AI. Please try again later." };
  }
}
