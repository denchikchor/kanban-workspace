import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Record<string, string> },
) {
  const { boardId } = params;

  try {
    const columns = await prisma.column.findMany({
      where: { boardId },
      include: { tasks: true },
    });

    return NextResponse.json(columns);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 },
    );
  }
}
