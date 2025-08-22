"use client";

import { useState } from "react";
import {
  useCreateTask,
  useDeleteColumn,
  useDeleteTask,
  useUpdateColumnTitle,
  useUpdateTaskTitle,
} from "@/features/board/hooks";
import { Droppable, Draggable } from "@hello-pangea/dnd";

type TaskLite = { id: string; title: string };

export default function ColumnCard({
  boardId,
  colId,
  title,
  tasks,
  dragHandleProps,
}: {
  boardId: string;
  colId: string;
  title: string;
  tasks: TaskLite[];
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const createTask = useCreateTask(boardId, colId);
  const delColumn = useDeleteColumn(boardId);
  const delTask = useDeleteTask(boardId);

  // inline edit: column title
  const [editingCol, setEditingCol] = useState(false);
  const [colValue, setColValue] = useState(title);
  const updateColumn = useUpdateColumnTitle(boardId);

  const saveColumnTitle = () => {
    const v = colValue.trim();
    if (v && v !== title) {
      updateColumn.mutate({ columnId: colId, title: v });
    } else {
      setColValue(title);
    }
    setTimeout(() => setEditingCol(false), 100);
  };

  return (
    <div className="min-w-[260px] rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        {/* Column title / editor */}
        <div className="flex items-center gap-2">
          <div {...dragHandleProps} className="cursor-grab select-none" title="Drag column">
            ⠿
          </div>

          {editingCol ? (
            <>
              <input
                autoFocus
                value={colValue}
                onChange={(e) => setColValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveColumnTitle();
                  if (e.key === "Escape") {
                    setColValue(title);
                    setEditingCol(false);
                  }
                }}
                className="bg-transparent outline-none text-lg font-medium border-b border-neutral-300"
              />
              <button
                type="button"
                onClick={saveColumnTitle}
                className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
                aria-label="Save column title"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <div className="text-lg font-medium">{title}</div>
              <button
                type="button"
                onClick={() => setEditingCol(true)}
                className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
                aria-label="Edit column title"
                title="Edit column title"
              >
                ✏️
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => delColumn.mutate(colId)}
          className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
          aria-label="Delete column"
          title="Delete column"
        >
          🗑
        </button>
      </div>

      <form
        className="mb-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!taskTitle.trim()) return;
          createTask.mutate(taskTitle.trim(), { onSuccess: () => setTaskTitle("") });
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

      <Droppable droppableId={colId} type="task">
        {(drop) => (
          <ul ref={drop.innerRef} {...drop.droppableProps} className="space-y-2">
            {tasks.map((t, index) => (
              <Draggable key={t.id} draggableId={t.id} index={index}>
                {(drag) => (
                  <li
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    {...drag.dragHandleProps}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
                  >
                    <TaskRow boardId={boardId} task={t} delTask={delTask} />
                  </li>
                )}
              </Draggable>
            ))}
            {drop.placeholder}
          </ul>
        )}
      </Droppable>
    </div>
  );
}

function TaskRow({
  boardId,
  task,
  delTask,
}: {
  boardId: string;
  task: { id: string; title: string };
  delTask: ReturnType<typeof useDeleteTask>;
}) {
  const updateTask = useUpdateTaskTitle(boardId);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.title);

  const save = () => {
    const v = value.trim();
    if (v && v !== task.title) {
      updateTask.mutate({ taskId: task.id, title: v });
    } else {
      setValue(task.title);
    }
    setTimeout(() => setEditing(false), 100);
  };

  return (
    <li className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") {
                  setValue(task.title);
                  setEditing(false);
                }
              }}
              onBlur={save}
              className="bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
              aria-label="Save task title"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <span>{task.title}</span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
              aria-label="Edit task title"
              title="Edit task title"
            >
              ✏️
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => delTask.mutate(task.id)}
        className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
        aria-label="Delete task"
        title="Delete task"
      >
        ×
      </button>
    </li>
  );
}
