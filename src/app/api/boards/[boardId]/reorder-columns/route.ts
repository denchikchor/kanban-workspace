import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ok } from "assert";
import { error } from "console";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const { sourceIndex, destinationIndex } = await req.json();

  if (
    typeof sourceIndex !== "number" ||
    typeof destinationIndex !== "number" ||
    sourceIndex === destinationIndex
  ) {
    return NextResponse.json({ ok: true });
  }

  const moving = await prisma.column.findFirst({
    where: { boardId, order: sourceIndex },
    select: { id: true },
  });
  if (!moving) {
    return NextResponse.json({ error: "Column to move not found" }, { status: 400 });
  }

  if (destinationIndex < sourceIndex) {
    await prisma.$transaction([
      prisma.column.updateMany({
        where: {
          boardId,
          order: {
            gte: destinationIndex,
            lt: sourceIndex,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      }),
      prisma.column.update({
        where: { id: moving.id },
        data: { order: destinationIndex },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.column.updateMany({
        where: {
          boardId,
          order: {
            gte: destinationIndex,
            lt: sourceIndex,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      }),
      prisma.column.update({
        where: { id: moving.id },
        data: { order: destinationIndex },
      }),
    ]);
  }
  return NextResponse.json({ ok: true });
}
