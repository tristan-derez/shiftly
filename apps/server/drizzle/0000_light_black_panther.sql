CREATE TYPE "public"."day_status" AS ENUM('planned', 'rest', 'unplanned');--> statement-breakpoint
CREATE TYPE "public"."job" AS ENUM('F', 'Amb', 'L1', 'L2', 'Firam', 'Ram');--> statement-breakpoint
CREATE TYPE "public"."shift_period" AS ENUM('morning', 'afternoon');--> statement-breakpoint
CREATE TABLE "day_schedules" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"date" date NOT NULL,
	"status" "day_status" DEFAULT 'unplanned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "day_schedules_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"day_schedule_id" uuid NOT NULL,
	"period" "shift_period" NOT NULL,
	"start" time(0) NOT NULL,
	"end" time(0) NOT NULL,
	"job" "job" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shifts_day_schedule_period_unique" UNIQUE("day_schedule_id","period")
);
--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_day_schedule_id_day_schedules_id_fk" FOREIGN KEY ("day_schedule_id") REFERENCES "public"."day_schedules"("id") ON DELETE cascade ON UPDATE no action;