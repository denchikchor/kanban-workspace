"use client";

import { Board } from "@/types/kanban";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBoards() {
  return useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await fetch("/api/boards", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch boards");
      return res.json();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create board");
      return res.json() as Promise<Board>;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (boardId: string) => {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete board");
      return true;
    },
    onMutate: async (boardId: string) => {
      await qc.cancelQueries({ queryKey: ["boards"] });
      const prev = qc.getQueryData<Board[]>(["boards"]) ?? [];
      qc.setQueryData<Board[]>(
        ["boards"],
        prev.filter((board) => board.id !== boardId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["boards"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

export function useUpdateBoardTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ boardId, title }: { boardId: string; title: string }) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update board title");
      return res.json() as Promise<Board>;
    },
    onMutate: async ({ boardId, title }) => {
      await qc.cancelQueries({ queryKey: ["boards"] });
      const prev = qc.getQueryData<Board[]>(["boards"]) ?? [];
      qc.setQueryData<Board[]>(
        ["boards"],
        prev.map((board) => (board.id === boardId ? { ...board, title } : board))
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["boards"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
