CREATE TYPE "public"."platform" AS ENUM('bilibili');--> statement-breakpoint
CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" "platform" DEFAULT 'bilibili' NOT NULL,
	"platformId" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"authorId" serial NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postsToRestaurants" (
	"postId" integer NOT NULL,
	"restaurantId" uuid NOT NULL,
	CONSTRAINT "postsToRestaurants_postId_restaurantId_pk" PRIMARY KEY("postId","restaurantId")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_authors_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postsToRestaurants" ADD CONSTRAINT "postsToRestaurants_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postsToRestaurants" ADD CONSTRAINT "postsToRestaurants_restaurantId_restaurant_id_fk" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurant"("id") ON DELETE cascade ON UPDATE no action;