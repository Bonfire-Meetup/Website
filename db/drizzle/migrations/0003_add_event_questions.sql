CREATE TABLE "event_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" text NOT NULL,
	"talk_index" integer,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_question_boost" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_question" ADD CONSTRAINT "event_question_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_question_boost" ADD CONSTRAINT "event_question_boost_question_id_event_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."event_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_question_boost" ADD CONSTRAINT "event_question_boost_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_question_event_id_idx" ON "event_question" USING btree ("event_id" text_ops);--> statement-breakpoint
CREATE INDEX "event_question_user_id_idx" ON "event_question" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "event_question_created_at_idx" ON "event_question" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "event_question_boost_question_id_idx" ON "event_question_boost" USING btree ("question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "event_question_boost_user_id_idx" ON "event_question_boost" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "event_question_boost_unique_idx" ON "event_question_boost" USING btree ("question_id" uuid_ops,"user_id" uuid_ops);