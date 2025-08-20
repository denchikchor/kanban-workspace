import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> },
) {
  const { columnId } = await params;

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  if (!column)
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  return NextResponse.json(column);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> },
) {
  const { boardId, columnId } = await params;

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { columnId } }),
    prisma.column.delete({ where: { id: columnId } }),
  ]);

  return NextResponse.json({ ok: true });
}
