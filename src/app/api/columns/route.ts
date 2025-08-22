import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { title, boardId } = await req.json();
  if (!title || !boardId)
    return NextResponse.json({ error: "Title and Board ID are required" }, { status: 400 });

  const max = await prisma.column.aggregate({
    where: { boardId },
    _max: { order: true },
  });
  const created = await prisma.column.create({
    data: { title, boardId, order: (max._max.order ?? -1) + 1 },
  });
  return NextResponse.json(created, { status: 201 });
}
