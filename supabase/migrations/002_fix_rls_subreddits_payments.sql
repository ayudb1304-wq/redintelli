-- Fix missing RLS on subreddits and payment_events tables

-- Subreddits: publicly readable, writes via service_role only
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subreddits are publicly readable" ON subreddits
  FOR SELECT USING (true);

-- Payment events: no user access, service_role only
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
