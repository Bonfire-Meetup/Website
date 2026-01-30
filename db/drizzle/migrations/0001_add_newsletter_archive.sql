CREATE TABLE "newsletter_archive" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text,
	"data" jsonb NOT NULL,
	"audience_type" text NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_by" uuid,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"test_send" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletter_archive" ADD CONSTRAINT "newsletter_archive_sent_by_app_user_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "newsletter_archive_sent_at_idx" ON "newsletter_archive" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "newsletter_archive_sent_by_idx" ON "newsletter_archive" USING btree ("sent_by");