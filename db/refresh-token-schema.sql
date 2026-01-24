-- Refresh token table for secure token rotation
-- Migration: Access token only → Access + Refresh tokens
-- 
-- Security: We store only the SHA-256 hash of the token.
-- The actual token is stored in httpOnly cookie.
-- Even if the database is breached, tokens cannot be used.

CREATE TABLE IF NOT EXISTS auth_refresh_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  token_family_id UUID NOT NULL,
  parent_id UUID REFERENCES auth_refresh_token(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  ip INET,
  user_agent TEXT
);

-- Index for looking up tokens by hash (primary lookup method)
CREATE INDEX IF NOT EXISTS auth_refresh_token_hash_idx ON auth_refresh_token (token_hash);

-- Index for looking up tokens by user
CREATE INDEX IF NOT EXISTS auth_refresh_token_user_idx ON auth_refresh_token (user_id);

-- Index for token family revocation (theft detection)
CREATE INDEX IF NOT EXISTS auth_refresh_token_family_idx ON auth_refresh_token (token_family_id);

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS auth_refresh_token_expires_idx ON auth_refresh_token (expires_at);

-- Index for finding active tokens
CREATE INDEX IF NOT EXISTS auth_refresh_token_active_idx ON auth_refresh_token (token_hash) 
  WHERE revoked_at IS NULL AND expires_at > now();

-- Cleanup function for expired tokens (run periodically)
-- DELETE FROM auth_refresh_token WHERE expires_at < now() - INTERVAL '7 days';
