import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  if (!boardId) {
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(board);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { column: { boardId } } }),
    prisma.column.deleteMany({ where: { boardId } }),
    prisma.board.delete({ where: { id: boardId } }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function PUT(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const { title } = await _req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const updated = await prisma.board.update({ where: { id: boardId }, data: { title } });
  return NextResponse.json(updated);
}
