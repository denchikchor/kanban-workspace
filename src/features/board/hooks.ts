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
  const key = ["columns", boardId] as const;
  return useMutation({
    mutationFn: async (columnId: string) => {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete column");
      return true;
    },
    onMutate: async (columnId: string) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) || [];
      qc.setQueryData<ColumnWithTasks[]>(
        key,
        prev.filter((column) => column.id !== columnId)
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      qc.setQueryData(key, ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useUpdateColumnTitle(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;
  return useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update column");
      return res.json() as Promise<ColumnWithTasks>;
    },
    onMutate: async ({ columnId, title }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) ?? [];
      qc.setQueryData<ColumnWithTasks[]>(
        key,
        prev.map((column) => (column.id === columnId ? { ...column, title } : column))
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      qc.setQueryData(key, ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useReorderColumns(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  return useMutation({
    mutationFn: async (args: { sourceIndex: number; destinationIndex: number }) => {
      const res = await fetch(`/api/boards/${boardId}/reorder-columns`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args }),
      });
      if (!res.ok) throw new Error("Failed to reorder columns");
      return res.json();
    },
    onMutate: async ({ sourceIndex, destinationIndex }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) ?? [];
      const next = prev.slice();
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(destinationIndex, 0, moved);
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _args, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
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

export function useUpdateTaskTitle(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;
  return useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json() as Promise<Task>;
    },
    onMutate: async ({ taskId, title }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) || [];
      const next = prev.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === taskId ? { ...task, title } : task)),
      }));
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useReorderTasks(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  return useMutation({
    mutationFn: async (args: {
      taskId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      sourceIndex: number;
      destinationIndex: number;
    }) => {
      const r = await fetch(`/api/tasks/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      if (!r.ok) throw new Error("Failed to reorder task");
      return r.json();
    },
    onMutate: async ({
      taskId,
      sourceColumnId,
      destinationColumnId,
      sourceIndex,
      destinationIndex,
    }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ColumnWithTasks[]>(key) ?? [];

      // глибока копія лише потрібних масивів
      const next = prev.map((c) =>
        c.id === sourceColumnId || c.id === destinationColumnId
          ? { ...c, tasks: c.tasks.slice() }
          : c
      );

      // знайти індекси колонок у масиві
      const srcColIdx = next.findIndex((c) => c.id === sourceColumnId);
      const dstColIdx = next.findIndex((c) => c.id === destinationColumnId);
      if (srcColIdx === -1 || dstColIdx === -1) return { prev };

      // витягнути таск
      const [moved] = next[srcColIdx].tasks.splice(sourceIndex, 1);
      if (!moved || moved.id !== taskId) return { prev };

      // вставити на місце
      next[dstColIdx].tasks.splice(destinationIndex, 0, moved);

      qc.setQueryData<ColumnWithTasks[]>(key, next);
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
