import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  if (!boardId)
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });

  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(columns);
}
