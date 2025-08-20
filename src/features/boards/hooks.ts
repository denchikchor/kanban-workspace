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
