"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
  useBoard,
  useColumns,
  useCreateColumn,
  useReorderColumns,
  useReorderTasks,
} from "@/features/board/hooks";
import ColumnCard from "@/features/board/components/ColumnCard";
import Link from "next/link";
import { on } from "events";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board } = useBoard(boardId);
  const { data: columns = [], isLoading } = useColumns(boardId);
  const createColumn = useCreateColumn(boardId);
  const [colTitle, setColTitle] = useState("");
  const reorderColumns = useReorderColumns(boardId);
  const reorderTasks = useReorderTasks(boardId);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;

    if (type === "column") {
      if (source.index === destination.index) return;
      reorderColumns.mutate({ sourceIndex: source.index, destinationIndex: destination.index });
      return;
    }

    if (type === "task") {
      const sourceColumnId = source.droppableId;
      const destinationColumnId = destination.droppableId;
      if (sourceColumnId === destinationColumnId && source.index === destination.index) return;

      reorderTasks.mutate({
        taskId: draggableId,
        sourceColumnId,
        destinationColumnId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });
      return;
    }
  };

  if (!boardId) return null;

  return (
    <div className="p-6">
      <Link
        className="rounded-md px-2 py-1 text-lg hover:bg-neutral-100"
        aria-label="Boards"
        href={`/app`}
      >
        ← Boards
      </Link>
      <h1 className="mt-6 mb-4 text-2xl font-semibold">{board?.title ?? "Board"}</h1>

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
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Колонки */}
          <Droppable droppableId="board" direction="horizontal" type="column">
            {(drop) => (
              <div
                ref={drop.innerRef}
                {...drop.droppableProps}
                className="flex gap-4 overflow-x-auto"
              >
                {columns.map((c, index) => (
                  <Draggable key={c.id} draggableId={c.id} index={index}>
                    {(drag) => (
                      <div ref={drag.innerRef} {...drag.draggableProps} className="min-w-[260px]">
                        {/* dragHandleProps можна повісити на “хедер” колонки */}
                        <ColumnCard
                          boardId={boardId}
                          colId={c.id}
                          title={c.title}
                          tasks={c.tasks}
                          dragHandleProps={drag.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {drop.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
