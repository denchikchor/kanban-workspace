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
