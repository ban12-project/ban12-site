ALTER TABLE "gangchelin" RENAME TO "restaurant";--> statement-breakpoint
ALTER TABLE "restaurant" DROP CONSTRAINT "gangchelin_aid_bvid_pk";--> statement-breakpoint
ALTER TABLE "restaurant" ADD CONSTRAINT "restaurant_aid_bvid_pk" PRIMARY KEY("aid","bvid");