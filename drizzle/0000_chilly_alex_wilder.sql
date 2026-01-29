CREATE TABLE "app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"name" text,
	"roles" text[] DEFAULT '{}' NOT NULL,
	"membership_tier" smallint,
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email_hash" text NOT NULL,
	"email_domain" text,
	"outcome" text NOT NULL,
	"method" text,
	"ip_hash" text,
	"user_agent_hash" text,
	"user_agent_summary" text,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_challenge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_token_hash" text NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" "inet",
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "auth_passkey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" bigint DEFAULT 0 NOT NULL,
	"device_type" text,
	"backed_up" boolean DEFAULT false NOT NULL,
	"transports" text[],
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "auth_passkey_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "auth_passkey_challenge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"challenge" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_refresh_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"token_family_id" uuid NOT NULL,
	"parent_id" uuid,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"ip" "inet",
	"user_agent" text,
	CONSTRAINT "auth_refresh_token_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "auth_token" (
	"jti" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip" "inet",
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "check_in" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"inquiry_type" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"ip_hash" text,
	"user_agent_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscription_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "talk_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"speaker_name" text NOT NULL,
	"email" text NOT NULL,
	"talk_title" text NOT NULL,
	"abstract" text NOT NULL,
	"duration" text NOT NULL,
	"experience" text,
	"preferred_location" text,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_boost_allocation" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"available_boosts" integer DEFAULT 3 NOT NULL,
	"last_allocation_date" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" text NOT NULL,
	"ip_hash" text NOT NULL,
	"ua_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_attempt" ADD CONSTRAINT "auth_attempt_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_passkey" ADD CONSTRAINT "auth_passkey_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_passkey_challenge" ADD CONSTRAINT "auth_passkey_challenge_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_refresh_token" ADD CONSTRAINT "auth_refresh_token_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_refresh_token" ADD CONSTRAINT "auth_refresh_token_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."auth_refresh_token"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_boost_allocation" ADD CONSTRAINT "user_boost_allocation_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_watchlist" ADD CONSTRAINT "user_watchlist_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_boosts" ADD CONSTRAINT "video_boosts_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_user_email_idx" ON "app_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "app_user_membership_tier_idx" ON "app_user" USING btree ("membership_tier") WHERE (membership_tier IS NOT NULL);--> statement-breakpoint
CREATE INDEX "auth_attempt_user_idx" ON "auth_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_attempt_email_created_idx" ON "auth_attempt" USING btree ("email_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_challenge_token_hash_idx" ON "auth_challenge" USING btree ("challenge_token_hash");--> statement-breakpoint
CREATE INDEX "auth_challenge_email_created_idx" ON "auth_challenge" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "auth_challenge_expires_idx" ON "auth_challenge" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_challenge_used_idx" ON "auth_challenge" USING btree ("used_at");--> statement-breakpoint
CREATE INDEX "idx_auth_passkey_user_id" ON "auth_passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_passkey_credential_id" ON "auth_passkey" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "idx_auth_passkey_challenge_expires" ON "auth_passkey_challenge" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_refresh_token_hash_idx" ON "auth_refresh_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_refresh_token_user_idx" ON "auth_refresh_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_refresh_token_family_idx" ON "auth_refresh_token" USING btree ("token_family_id");--> statement-breakpoint
CREATE INDEX "auth_refresh_token_expires_idx" ON "auth_refresh_token" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_token_user_idx" ON "auth_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_token_expires_idx" ON "auth_token" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "check_in_user_event_idx" ON "check_in" USING btree ("user_id","event_id");--> statement-breakpoint
CREATE INDEX "check_in_user_id_idx" ON "check_in" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "check_in_event_id_idx" ON "check_in" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "check_in_created_at_idx" ON "check_in" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_submissions_ip_hash_idx" ON "contact_submissions" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "newsletter_subscription_email_idx" ON "newsletter_subscription" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_subscription_created_idx" ON "newsletter_subscription" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "talk_proposals_ip_hash_idx" ON "talk_proposals" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "talk_proposals_created_at_idx" ON "talk_proposals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_boost_allocation_last_allocation_idx" ON "user_boost_allocation" USING btree ("last_allocation_date");--> statement-breakpoint
CREATE UNIQUE INDEX "user_watchlist_user_video_idx" ON "user_watchlist" USING btree ("user_id","video_id");--> statement-breakpoint
CREATE INDEX "user_watchlist_user_id_idx" ON "user_watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_watchlist_video_id_idx" ON "user_watchlist" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "user_watchlist_created_at_idx" ON "user_watchlist" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "video_boosts_video_user_idx" ON "video_boosts" USING btree ("video_id","user_id");--> statement-breakpoint
CREATE INDEX "video_boosts_video_id_idx" ON "video_boosts" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_boosts_user_id_idx" ON "video_boosts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "video_likes_video_ip_ua_idx" ON "video_likes" USING btree ("video_id","ip_hash","ua_hash");--> statement-breakpoint
CREATE INDEX "video_likes_video_id_idx" ON "video_likes" USING btree ("video_id");