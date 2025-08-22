-- AlterTable
ALTER TABLE "public"."Column" ALTER COLUMN "order" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Task" ALTER COLUMN "order" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Column_boardId_order_idx" ON "public"."Column"("boardId", "order");

-- CreateIndex
CREATE INDEX "Task_columnId_order_idx" ON "public"."Task"("columnId", "order");
