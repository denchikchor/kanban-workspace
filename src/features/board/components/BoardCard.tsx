"use client";
import { useState } from "react";
import Link from "next/link";
import { on } from "events";

type BoardCardProps = {
  board: { id: string; title: string; createdAt: string };
  onUpdate: (args: { boardId: string; title: string }) => void;
  onDelete: (boardId: string) => void;
};

export default function BoardCard({ board, onUpdate, onDelete }: BoardCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(board.title);

  const handleSave = () => {
    const v = value.trim();
    if (v && v !== board.title) {
      onUpdate({ boardId: board.id, title: v });
    }
    setTimeout(() => setEditing(false), 100);
  };

  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-4 flex justify-between">
      <div>
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setValue(board.title);
                setEditing(false);
              }
            }}
            className="bg-transparent outline-none font-medium text-lg"
          />
        ) : (
          <Link href={`/app/board/${board.id}`} className="text-lg font-medium hover:underline">
            {board.title}
          </Link>
        )}
        <div className="text-sm text-neutral-500 mt-1">
          {new Date(board.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
            aria-label="Save changes"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
            aria-label="Edit board"
          >
            ✏️
          </button>
        )}

        <button
          onClick={() => onDelete(board.id)}
          className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
          aria-label="Delete board"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
