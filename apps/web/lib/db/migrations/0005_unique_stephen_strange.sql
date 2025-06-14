ALTER TABLE "restaurant" DROP CONSTRAINT "restaurant_aid_bvid_pk";--> statement-breakpoint
ALTER TABLE "restaurant" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant" ADD COLUMN "invisible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant" ADD COLUMN "ai_summarize" jsonb;