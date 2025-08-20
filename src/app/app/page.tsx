"use client";

import { useBoards, useCreateBoard, useDeleteBoard } from "@/features/boards/hooks";
import Link from "next/link";
import { useState } from "react";

export default function AppHome() {
  const { data, isLoading, isError } = useBoards();
  const createBoard = useCreateBoard();
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(true);
  const delBoard = useDeleteBoard();

  return (
    <div className="grid min-h-[calc(100dvh-0px)] grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside
        className={`border-r border-neutral-200 bg-white p-4 ${open ? "" : "hidden md:block"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold">Navigation</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-sm hover:bg-neutral-100 md:hidden"
          >
            Close
          </button>
        </div>
        <nav className="space-y-1">
          <Link href="/app" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
            Dashboard
          </Link>
          <span className="block rounded-lg px-3 py-2 text-neutral-400">Boards (coming soon)</span>
          <span className="block rounded-lg px-3 py-2 text-neutral-400">
            Settings (coming soon)
          </span>
        </nav>
      </aside>

      {/* Content */}
      <main className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="mb-4 rounded-lg border border-neutral-200 px-3 py-1 text-sm hover:bg-neutral-100 md:hidden"
        >
          Menu
        </button>

        <h2 className="mb-2 text-2xl font-semibold">Your Board</h2>

        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createBoard.mutate(title.trim(), { onSuccess: () => setTitle("") });
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board name"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 md:w-3/4"
          />
          <button
            type="submit"
            disabled={createBoard.isPending}
            className="rounded-md bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-900 md:w-1/4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createBoard.isPending ? "Creating..." : "Create Board"}
          </button>
        </form>

        {isLoading && <div className="text-neutral-500">Loading...</div>}
        {isError && <div className="text-red-500">Error to load boards</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((b) => (
            <div key={b.id} className="rounded-xl border border-neutral-300 bg-white p-4 flex">
              <div>
                <Link href={`/app/board/${b.id}`} className="text-lg font-medium hover:underline">
                  {b.title}
                </Link>
                <div className="text-sm text-neutral-500 mt-1">
                  {new Date(b.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => delBoard.mutate(b.id)}
                className="ml-auto rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
                aria-label="Delete board"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
