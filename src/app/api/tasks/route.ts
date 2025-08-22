import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { title, columnId } = await req.json();
  if (!title || !columnId)
    return NextResponse.json({ error: "Title and Column ID are required" }, { status: 400 });

  const max = await prisma.task.aggregate({
    where: { columnId },
    _max: { order: true },
  });
  const created = await prisma.task.create({
    data: { title, columnId, order: (max._max.order ?? -1) + 1 },
  });
  return NextResponse.json(created, { status: 201 });
}
