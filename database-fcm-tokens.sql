-- ============================================================
-- FCM Device Tokens Table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cafe_id    uuid        REFERENCES cafes(id)      ON DELETE CASCADE NOT NULL,
  token      text        NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- One token per (user, device) pair
  UNIQUE(user_id, token)
);

-- Index for fast lookup when sending notifications for a cafe
CREATE INDEX IF NOT EXISTS idx_device_tokens_cafe_id ON device_tokens(cafe_id);

-- Row Level Security
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Each user can only read/write their own tokens
CREATE POLICY "Users manage own tokens"
  ON device_tokens
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can read all tokens (needed for server-side notification sending)
CREATE POLICY "Service role reads all tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION update_device_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW EXECUTE FUNCTION update_device_token_timestamp();
