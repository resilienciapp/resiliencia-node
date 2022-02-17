-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('accepted', 'pending', 'rejected');

-- CreateTable
CREATE TABLE "administrator_requests" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "marker_id" INTEGER NOT NULL,
    "status" "request_status" NOT NULL,

    CONSTRAINT "administrator_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "administrator_requests_user_id_idx" ON "administrator_requests"("user_id");

-- CreateIndex
CREATE INDEX "administrator_requests_marker_id_idx" ON "administrator_requests"("marker_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrator_requests_user_id_marker_id_key" ON "administrator_requests"("user_id", "marker_id");

-- AddForeignKey
ALTER TABLE "administrator_requests" ADD CONSTRAINT "administrator_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrator_requests" ADD CONSTRAINT "administrator_requests_marker_id_fkey" FOREIGN KEY ("marker_id") REFERENCES "markers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
