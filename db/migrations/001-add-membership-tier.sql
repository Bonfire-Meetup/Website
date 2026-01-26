ALTER TABLE app_user ADD COLUMN IF NOT EXISTS membership_tier smallint;
CREATE INDEX IF NOT EXISTS app_user_membership_tier_idx ON app_user (membership_tier) WHERE membership_tier IS NOT NULL;
