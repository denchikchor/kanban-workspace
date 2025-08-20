import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const created = await prisma.board.create({ data: { title } });
  return NextResponse.json(created, { status: 201 });
}
