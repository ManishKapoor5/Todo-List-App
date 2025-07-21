'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Check, Edit, MoreVertical, Trash2, Info } from 'lucide-react';
import type { Task, taskFormSchema } from '@/lib/types';
import { cn } from '@/lib/utils';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EditTaskDialog } from './edit-task-dialog';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, data: z.infer<typeof taskFormSchema>) => void;
}

const importanceVariantMap: Record<Task['importance'], 'secondary' | 'outline' | 'destructive'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'destructive',
};

export function TaskItem({ task, onToggleComplete, onDeleteTask, onEditTask }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <Card className={cn(
        "transition-all duration-300 ease-in-out hover:shadow-md",
        task.completed ? 'bg-muted/50' : 'bg-card'
      )}>
        <CardContent className="p-4 flex items-start gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onToggleComplete(task.id)}
                  className="mt-1"
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{task.completed ? 'Mark as pending' : 'Mark as complete'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 grid gap-2">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </label>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(task.dueDate, 'MMM d, yyyy')}</span>
                </div>
              )}
              <Badge variant={importanceVariantMap[task.importance]} className="capitalize">{task.importance}</Badge>
              {task.priorityScore !== undefined && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Badge variant="default" className="bg-primary/20 text-primary-foreground hover:bg-primary/30 cursor-help">
                         AI Score: {task.priorityScore}
                         {task.reasoning && <Info className="ml-2 h-3 w-3" />}
                       </Badge>
                    </TooltipTrigger>
                    {task.reasoning && (
                       <TooltipContent className="max-w-xs">
                         <p className="font-semibold">AI Reasoning:</p>
                         <p>{task.reasoning}</p>
                       </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} disabled={task.completed}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task: "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteTask(task.id)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskDialog
        task={task}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditTask={onEditTask}
      />
    </>
  );
}
