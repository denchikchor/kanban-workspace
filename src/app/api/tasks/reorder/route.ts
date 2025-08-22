import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

/**
 * PATCH /api/tasks/reorder
 * body:
 * {
 *   taskId: string,
 *   sourceColumnId: string,
 *   destinationColumnId: string,
 *   sourceIndex: number,
 *   destinationIndex: number
 * }
 */
export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    taskId: string;
    sourceColumnId: string;
    destinationColumnId: string;
    sourceIndex: number;
    destinationIndex: number;
  };

  const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = body;

  if (
    !taskId ||
    !sourceColumnId ||
    !destinationColumnId ||
    typeof sourceIndex !== "number" ||
    typeof destinationIndex !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // валідація існування таска
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { id: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  if (sourceColumnId === destinationColumnId) {
    // move within the same column
    if (destinationIndex === sourceIndex) {
      return NextResponse.json({ ok: true });
    }

    if (destinationIndex < sourceIndex) {
      // [dest, src-1] +=1
      await prisma.$transaction([
        prisma.task.updateMany({
          where: {
            columnId: sourceColumnId,
            order: { gte: destinationIndex, lt: sourceIndex },
          },
          data: { order: { increment: 1 } },
        }),
        prisma.task.update({
          where: { id: taskId },
          data: { order: destinationIndex },
        }),
      ]);
    } else {
      // [src+1, dest] -=1
      await prisma.$transaction([
        prisma.task.updateMany({
          where: {
            columnId: sourceColumnId,
            order: { gt: sourceIndex, lte: destinationIndex },
          },
          data: { order: { decrement: 1 } },
        }),
        prisma.task.update({
          where: { id: taskId },
          data: { order: destinationIndex },
        }),
      ]);
    }
  } else {
    // move between columns
    await prisma.$transaction([
      // зменшуємо order у source після sourceIndex
      prisma.task.updateMany({
        where: {
          columnId: sourceColumnId,
          order: { gt: sourceIndex },
        },
        data: { order: { decrement: 1 } },
      }),
      // збільшуємо order у destination від destinationIndex і нижче
      prisma.task.updateMany({
        where: {
          columnId: destinationColumnId,
          order: { gte: destinationIndex },
        },
        data: { order: { increment: 1 } },
      }),
      // переносимо таск
      prisma.task.update({
        where: { id: taskId },
        data: {
          columnId: destinationColumnId,
          order: destinationIndex,
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
