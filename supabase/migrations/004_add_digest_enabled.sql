-- Add digest opt-out preference to profiles
ALTER TABLE profiles ADD COLUMN digest_enabled BOOLEAN DEFAULT TRUE;
