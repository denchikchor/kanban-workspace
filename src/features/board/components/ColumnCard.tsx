"use client";

import { useState } from "react";
import { useCreateTask } from "@/features/board/hooks";

type TaskLite = { id: string; title: string };

export default function ColumnCard({
  boardId,
  colId,
  title,
  tasks,
}: {
  boardId: string;
  colId: string;
  title: string;
  tasks: TaskLite[];
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const createTask = useCreateTask(boardId, colId);

  return (
    <div className="min-w-[260px] rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 text-lg font-medium">{title}</div>

      <form
        className="mb-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!taskTitle.trim()) return;
          createTask.mutate(taskTitle.trim(), {
            onSuccess: () => setTaskTitle(""),
          });
        }}
      >
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="New task"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-700 px-3 py-2 text-white hover:bg-neutral-900"
          disabled={createTask.isPending}
        >
          +
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
          >
            {t.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
