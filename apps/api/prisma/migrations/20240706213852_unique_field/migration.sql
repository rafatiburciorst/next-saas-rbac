/*
  Warnings:

  - A unique constraint covering the columns `[email,organization_id]` on the table `invites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `invites` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invites_email_idx";

-- DropIndex
DROP INDEX "invites_email_organization_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "invites_email_organization_id_key" ON "invites"("email", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_email_key" ON "invites"("email");
