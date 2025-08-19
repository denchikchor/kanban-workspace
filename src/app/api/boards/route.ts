import { Board } from "@/types/kanban";
import { NextResponse } from "next/server";

let boards: Board[] = [
  { id: "b1", title: "Personal", createdAt: new Date().toISOString() },
  { id: "b2", title: "Work", createdAt: new Date().toISOString() },
  { id: "b3", title: "Side Projects", createdAt: new Date().toISOString() },
];

export async function GET() {
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const newBoard: Board = {
    id: `b_${Math.random().toString(35).slice(2, 8)}`,
    title,
    createdAt: new Date().toISOString(),
  };
  boards.unshift(newBoard);
  return NextResponse.json(newBoard, { status: 201 });
}
