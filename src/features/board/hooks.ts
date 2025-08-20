"use client";

import { Board, Column, ColumnWithTasks, Task } from "@/types/kanban";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBoard(boardId: string) {
  return useQuery<Board>({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch board");
      return res.json();
    },
    enabled: !!boardId,
  });
}

export function useColumns(boardId: string) {
  return useQuery<ColumnWithTasks[]>({
    queryKey: ["columns", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/columns`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch columns");
      return res.json();
    },
    enabled: !!boardId,
    initialData: [],
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}

export function useCreateColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, boardId }),
      });
      if (!res.ok) throw new Error("Failed to create column");
      return res.json() as Promise<Column>;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (columnId: string) => {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete column");
      return true;
    },
    onMutate: async (columnId: string) => {
      const key = ["columns", boardId] as const;
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) || [];
      qc.setQueryData<ColumnWithTasks[]>(
        key,
        prev.filter((column) => column.id !== columnId)
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      qc.setQueryData(["columns", boardId], ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });
}

export function useCreateTask(boardId: string, columnId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, columnId }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json() as Promise<Task>;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });
}

export function useDeleteTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return true;
    },
    onMutate: async (taskId: string) => {
      const key = ["columns", boardId] as const;
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) || [];
      const next = prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }));
      qc.setQueryData<ColumnWithTasks[]>(key, next);
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["columns", boardId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });
}
