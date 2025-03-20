-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "gangchelin" (
	"comment" integer NOT NULL,
	"typeid" integer NOT NULL,
	"play" integer NOT NULL,
	"pic" text NOT NULL,
	"subtitle" text NOT NULL,
	"description" text NOT NULL,
	"copyright" varchar NOT NULL,
	"title" text NOT NULL,
	"review" integer NOT NULL,
	"author" text NOT NULL,
	"mid" integer NOT NULL,
	"created" integer NOT NULL,
	"length" varchar NOT NULL,
	"video_review" integer NOT NULL,
	"aid" bigint NOT NULL,
	"bvid" varchar NOT NULL,
	"hide_click" boolean NOT NULL,
	"is_pay" integer NOT NULL,
	"is_union_video" integer NOT NULL,
	"is_steins_gate" integer NOT NULL,
	"is_live_playback" integer NOT NULL,
	"is_lesson_video" integer NOT NULL,
	"is_lesson_finished" integer NOT NULL,
	"lesson_update_info" text NOT NULL,
	"jump_url" text NOT NULL,
	"meta" jsonb NOT NULL,
	"is_avoided" integer NOT NULL,
	"season_id" integer NOT NULL,
	"attribute" integer NOT NULL,
	"is_charging_arc" boolean NOT NULL,
	"elec_arc_type" integer NOT NULL,
	"vt" integer NOT NULL,
	"enable_vt" integer NOT NULL,
	"vt_display" text NOT NULL,
	"playback_position" integer NOT NULL,
	"is_self_view" boolean NOT NULL,
	CONSTRAINT "gangchelin_aid_bvid_pk" PRIMARY KEY("aid","bvid")
);

*/