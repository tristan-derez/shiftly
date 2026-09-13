CREATE TYPE "public"."day_status" AS ENUM('planned', 'rest', 'unplanned');--> statement-breakpoint
CREATE TYPE "public"."job" AS ENUM('F', 'Amb', 'L1', 'L2', 'Firam', 'Ram');--> statement-breakpoint
CREATE TYPE "public"."shift_period" AS ENUM('morning', 'afternoon');--> statement-breakpoint
CREATE TABLE "day_schedules" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "day_status" DEFAULT 'unplanned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "day_schedules_user_date_unique" UNIQUE("user_id","date")
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(100) NOT NULL,
	"username" varchar(30) NOT NULL,
	"email" varchar(254),
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "day_schedules" ADD CONSTRAINT "day_schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_day_schedule_id_day_schedules_id_fk" FOREIGN KEY ("day_schedule_id") REFERENCES "public"."day_schedules"("id") ON DELETE cascade ON UPDATE no action;