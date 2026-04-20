-- ============================================
-- RedIntelli - Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends Supabase auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Subscription info
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  dodo_customer_id TEXT,
  dodo_subscription_id TEXT,
  subscription_current_period_end TIMESTAMPTZ,

  -- Usage tracking
  briefs_generated_this_month INT DEFAULT 0,
  briefs_limit INT DEFAULT 2,
  tracked_subreddits_count INT DEFAULT 0,
  tracked_subreddits_limit INT DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_brief_generated_at TIMESTAMPTZ,
  usage_reset_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 2. SUBREDDITS (cached metadata)
-- ============================================

CREATE TABLE subreddits (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  public_description TEXT,
  subscribers INT,
  active_users INT,
  created_utc TIMESTAMPTZ,

  posts_per_day FLOAT,
  avg_comments_per_post FLOAT,
  promo_tolerance TEXT CHECK (promo_tolerance IN ('none', 'low', 'medium', 'high')),

  categories TEXT[],
  related_subreddits TEXT[],
  rules JSONB,

  search_vector TSVECTOR,

  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subreddits are publicly readable" ON subreddits
  FOR SELECT USING (true);

CREATE INDEX subreddits_search_idx ON subreddits USING GIN(search_vector);
CREATE INDEX subreddits_subscribers_idx ON subreddits(subscribers DESC);
CREATE INDEX subreddits_categories_idx ON subreddits USING GIN(categories);

CREATE OR REPLACE FUNCTION update_subreddit_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.display_name, '') || ' ' ||
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.public_description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subreddits_search_vector_update
  BEFORE INSERT OR UPDATE ON subreddits
  FOR EACH ROW EXECUTE FUNCTION update_subreddit_search_vector();


-- 3. AUDIENCE BRIEFS
-- ============================================

CREATE TABLE audience_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subreddit_id TEXT REFERENCES subreddits(id),

  content JSONB NOT NULL,

  model_version TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INT,
  generation_time_ms INT,

  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,

  is_cached BOOLEAN DEFAULT FALSE,
  cache_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX briefs_user_id_idx ON audience_briefs(user_id);
CREATE INDEX briefs_subreddit_id_idx ON audience_briefs(subreddit_id);
CREATE INDEX briefs_created_at_idx ON audience_briefs(created_at DESC);
CREATE INDEX briefs_cached_idx ON audience_briefs(is_cached, subreddit_id) WHERE is_cached = TRUE;

ALTER TABLE audience_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefs" ON audience_briefs
  FOR SELECT USING (auth.uid() = user_id OR is_cached = TRUE);

CREATE POLICY "Users can create own briefs" ON audience_briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs" ON audience_briefs
  FOR DELETE USING (auth.uid() = user_id);


-- 4. DISCOVERY SESSIONS
-- ============================================

CREATE TABLE discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  product_description TEXT NOT NULL,
  target_audience TEXT,

  discovered_subreddits JSONB NOT NULL DEFAULT '[]',

  model_version TEXT,
  tokens_used INT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX discovery_user_id_idx ON discovery_sessions(user_id);
CREATE INDEX discovery_created_at_idx ON discovery_sessions(created_at DESC);

ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON discovery_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON discovery_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. TRACKED SUBREDDITS (monitoring)
-- ============================================

CREATE TABLE tracked_subreddits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subreddit_id TEXT REFERENCES subreddits(id),

  keywords TEXT[],
  include_comments BOOLEAN DEFAULT FALSE,
  min_intent_score INT DEFAULT 0,

  notify_email BOOLEAN DEFAULT TRUE,
  notify_digest BOOLEAN DEFAULT TRUE,

  is_active BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ,
  last_post_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, subreddit_id)
);

CREATE INDEX tracked_user_id_idx ON tracked_subreddits(user_id);
CREATE INDEX tracked_active_idx ON tracked_subreddits(is_active) WHERE is_active = TRUE;

ALTER TABLE tracked_subreddits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tracked subreddits" ON tracked_subreddits
  FOR ALL USING (auth.uid() = user_id);


-- 6. MATCHED POSTS (from monitoring)
-- ============================================

CREATE TABLE matched_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tracked_subreddit_id UUID REFERENCES tracked_subreddits(id) ON DELETE CASCADE,

  post_id TEXT NOT NULL,
  subreddit_id TEXT NOT NULL,
  title TEXT NOT NULL,
  selftext TEXT,
  url TEXT,
  author TEXT,
  score INT,
  num_comments INT,
  created_utc TIMESTAMPTZ,
  permalink TEXT,

  intent_score INT,
  intent_label TEXT,
  matched_keywords TEXT[],

  is_read BOOLEAN DEFAULT FALSE,
  is_saved BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,

  matched_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id)
);

CREATE INDEX matched_user_id_idx ON matched_posts(user_id);
CREATE INDEX matched_unread_idx ON matched_posts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX matched_intent_idx ON matched_posts(intent_score DESC);

ALTER TABLE matched_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own matched posts" ON matched_posts
  FOR ALL USING (auth.uid() = user_id);


-- 7. PAYMENT EVENTS (Dodo webhooks)
-- ============================================

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  dodo_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,

  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- No user-facing policies - only service_role key can read/write payment events

CREATE INDEX payment_events_unprocessed_idx ON payment_events(processed) WHERE processed = FALSE;


-- 8. DATABASE FUNCTIONS
-- ============================================

-- Reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    briefs_generated_this_month = 0,
    usage_reset_at = NOW()
  WHERE usage_reset_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can generate brief
CREATE OR REPLACE FUNCTION can_generate_brief(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;

  IF user_profile.briefs_limit = -1 THEN
    RETURN TRUE;
  END IF;

  RETURN user_profile.briefs_generated_this_month < user_profile.briefs_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment brief count
CREATE OR REPLACE FUNCTION increment_brief_count(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    briefs_generated_this_month = briefs_generated_this_month + 1,
    last_brief_generated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. SEED DATA (dev subreddits)
-- ============================================

INSERT INTO subreddits (id, display_name, title, subscribers, categories, promo_tolerance)
VALUES
  ('saas', 'SaaS', 'Software as a Service', 85000, ARRAY['business', 'startups', 'software'], 'medium'),
  ('entrepreneur', 'Entrepreneur', 'Teknical Entreprenuership', 1200000, ARRAY['business', 'startups'], 'medium'),
  ('startups', 'startups', 'Teknical Startups', 950000, ARRAY['business', 'startups', 'tech'], 'low'),
  ('indiehackers', 'indiehackers', 'Indie Hackers', 45000, ARRAY['business', 'startups', 'indie'], 'high'),
  ('sideproject', 'SideProject', 'Side Project', 120000, ARRAY['business', 'projects', 'indie'], 'high'),
  ('buildinpublic', 'buildinpublic', 'Building in Public', 127000, ARRAY['business', 'indie', 'marketing'], 'high')
ON CONFLICT (id) DO NOTHING;
