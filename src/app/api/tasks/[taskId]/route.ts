import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
