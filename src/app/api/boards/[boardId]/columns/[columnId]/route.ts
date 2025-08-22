import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { columnId } = await params;

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  if (!column) return NextResponse.json({ error: "Column not found" }, { status: 404 });
  return NextResponse.json(column);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { boardId, columnId } = await params;

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { columnId } }),
    prisma.column.delete({ where: { id: columnId } }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { columnId } = await params;
  const { title } = await _req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const updated = await prisma.column.update({ where: { id: columnId }, data: { title } });
  return NextResponse.json(updated);
}
