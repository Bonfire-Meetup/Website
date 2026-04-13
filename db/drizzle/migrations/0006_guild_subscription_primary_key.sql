DROP INDEX "guild_subscription_user_id_unique_idx";--> statement-breakpoint
ALTER TABLE "guild_subscription" ADD PRIMARY KEY ("user_id");
