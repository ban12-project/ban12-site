ALTER TABLE "restaurant" ADD COLUMN "youtube" text;--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'processing', 'success', 'failed');--> statement-breakpoint
ALTER TABLE "restaurant" ADD COLUMN "status" "status" DEFAULT 'pending' NOT NULL;