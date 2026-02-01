CREATE TABLE "event_rsvp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_rsvp" ADD CONSTRAINT "event_rsvp_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_rsvp_event_id_idx" ON "event_rsvp" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_rsvp_user_id_idx" ON "event_rsvp" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_rsvp_user_event_unique_idx" ON "event_rsvp" USING btree ("user_id", "event_id");
