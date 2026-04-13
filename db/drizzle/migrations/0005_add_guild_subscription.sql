CREATE TABLE "guild_subscription" (
	"user_id" uuid NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"membership_tier" smallint,
	"status" text,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"last_invoice_id" text,
	"last_invoice_status" text,
	"last_charge_amount" integer,
	"last_charge_currency" text,
	"last_charge_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guild_subscription" ADD CONSTRAINT "guild_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "guild_subscription_user_id_unique_idx" ON "guild_subscription" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "guild_subscription_customer_id_unique_idx" ON "guild_subscription" USING btree ("stripe_customer_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "guild_subscription_subscription_id_unique_idx" ON "guild_subscription" USING btree ("stripe_subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "guild_subscription_status_idx" ON "guild_subscription" USING btree ("status" text_ops);