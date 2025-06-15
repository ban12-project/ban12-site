ALTER TABLE "restaurant" ADD COLUMN "location" "point";--> statement-breakpoint
ALTER TABLE "restaurant" DROP COLUMN "lat";--> statement-breakpoint
ALTER TABLE "restaurant" DROP COLUMN "lng";