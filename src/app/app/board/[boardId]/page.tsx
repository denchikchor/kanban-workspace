"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useBoard, useColumns, useCreateColumn } from "@/features/board/hooks";
import ColumnCard from "@/features/board/components/ColumnCard";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board } = useBoard(boardId);
  const { data: columns = [], isLoading } = useColumns(boardId);
  const createColumn = useCreateColumn(boardId);
  const [colTitle, setColTitle] = useState("");

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">{board?.title ?? "Board"}</h1>

      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!colTitle.trim()) return;
          createColumn.mutate(colTitle.trim(), {
            onSuccess: () => setColTitle(""),
          });
        }}
      >
        <input
          value={colTitle}
          onChange={(e) => setColTitle(e.target.value)}
          placeholder="New column"
          className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-900"
          disabled={createColumn.isPending}
        >
          {createColumn.isPending ? "Creating..." : "Add column"}
        </button>
      </form>

      {isLoading ? (
        <div className="text-neutral-500">Loading columns…</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto">
          {(columns ?? []).map((c) => (
            <ColumnCard
              key={c.id}
              boardId={boardId}
              colId={c.id}
              title={c.title}
              tasks={c.tasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
