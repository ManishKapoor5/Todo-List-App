'use client';

import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

import type { Task } from '@/lib/types';
import { prioritizeTasks } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTaskForm } from '@/components/task/add-task-form';
import { TaskList } from '@/components/task/task-list';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// A simple SVG logo for TaskFlow
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 50L45 70L75 30" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="5" y="5" width="90" height="90" rx="15" stroke="hsl(var(--primary))" strokeWidth="10"/>
  </svg>
);


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks).map((t: Task) => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        })));
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to local storage", error);
      }
    }
  }, [tasks, isClient]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.priorityScore !== undefined && b.priorityScore !== undefined) {
        return b.priorityScore - a.priorityScore;
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [tasks]);

  const handleAddTask = (data: { title: string; dueDate?: Date; importance: 'low' | 'medium' | 'high' }) => {
    const newTask: Task = {
      id: uuidv4(),
      completed: false,
      ...data
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleEditTask = (id: string, data: { title: string; dueDate?: Date; importance: 'low' | 'medium' | 'high' }) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, ...data } : task));
  };

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    const tasksToPrioritize = tasks.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : undefined,
      importance: task.importance,
      completed: task.completed,
    }));

    const result = await prioritizeTasks(tasksToPrioritize);

    if (result.success && result.data) {
      const priorityMap = new Map(result.data.map(p => [p.id, { score: p.priorityScore, reasoning: p.reasoning }]));
      setTasks(prev => prev.map(task => {
        const priority = priorityMap.get(task.id);
        return priority ? { ...task, priorityScore: priority.score, reasoning: priority.reasoning } : task;
      }));
      toast({
        title: "Success",
        description: "Your tasks have been prioritized by AI.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "An unknown error occurred.",
      });
    }
    setIsPrioritizing(false);
  };


  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">TaskFlow</h1>
          </div>
          <Button onClick={handlePrioritize} disabled={isPrioritizing || tasks.length === 0}>
            {isPrioritizing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Prioritize with AI
          </Button>
        </header>
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTaskForm onAddTask={handleAddTask} />
          </CardContent>
        </Card>

        <TaskList
          tasks={sortedTasks}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      </div>
    </main>
  );
}
