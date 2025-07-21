'use client';

import { useMemo, useState } from 'react';
import type { Task, taskFormSchema } from '@/lib/types';
import { z } from 'zod';
import { TaskItem } from './task-item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '../ui/card';
import { ListTodo } from 'lucide-react';

type TaskFilter = 'all' | 'pending' | 'completed';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, data: z.infer<typeof taskFormSchema>) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteTask, onEditTask }: TaskListProps) {
  const [filter, setFilter] = useState<TaskFilter>('pending');

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'pending':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const pendingCount = useMemo(() => tasks.filter(task => !task.completed).length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);

  const EmptyState = () => (
    <Card className="mt-4 border-dashed">
        <CardContent className="p-6 text-center">
            <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No tasks here!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                {filter === 'pending' && pendingCount === 0 && tasks.length > 0
                    ? "Great job! You've completed all your tasks."
                    : "Add a new task to get started."
                }
            </p>
        </CardContent>
    </Card>
  );

  return (
    <Tabs value={filter} onValueChange={(value) => setFilter(value as TaskFilter)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
        <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
      </TabsList>
      <TabsContent value={filter}>
        {filteredTasks.length > 0 ? (
          <div className="space-y-4 pt-4">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </TabsContent>
    </Tabs>
  );
}
