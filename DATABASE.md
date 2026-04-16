# Database Schema

## Supabase PostgreSQL Schema

### Users & Authentication

Supabase Auth handles user management. We extend with a `profiles` table:

```sql
-- Profiles table (extends Supabase auth.users)
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
  briefs_limit INT DEFAULT 2, -- Free tier: 2, Starter: 10, Pro: unlimited (-1)
  tracked_subreddits_count INT DEFAULT 0,
  tracked_subreddits_limit INT DEFAULT 3, -- Free: 3, Starter: 10, Pro: 50
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_brief_generated_at TIMESTAMPTZ,
  usage_reset_at TIMESTAMPTZ DEFAULT NOW() -- Resets monthly
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
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
```

### Subreddits (Cached Metadata)

```sql
-- Cached subreddit metadata from Arctic Shift
CREATE TABLE subreddits (
  id TEXT PRIMARY KEY, -- Subreddit name (lowercase, no r/)
  display_name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  public_description TEXT,
  subscribers INT,
  active_users INT,
  created_utc TIMESTAMPTZ,
  
  -- Computed fields
  posts_per_day FLOAT,
  avg_comments_per_post FLOAT,
  promo_tolerance TEXT CHECK (promo_tolerance IN ('none', 'low', 'medium', 'high')),
  
  -- Categories/tags for discovery
  categories TEXT[], -- e.g., ['saas', 'startups', 'marketing']
  related_subreddits TEXT[], -- Similar subreddits
  
  -- Rules (from Arctic Shift)
  rules JSONB, -- Array of rule objects
  
  -- Search optimization
  search_vector TSVECTOR,
  
  -- Timestamps
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX subreddits_search_idx ON subreddits USING GIN(search_vector);
CREATE INDEX subreddits_subscribers_idx ON subreddits(subscribers DESC);
CREATE INDEX subreddits_categories_idx ON subreddits USING GIN(categories);

-- Update search vector on changes
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
```

### Audience Briefs

```sql
-- Generated audience briefs
CREATE TABLE audience_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subreddit_id TEXT REFERENCES subreddits(id),
  
  -- Brief content (stored as JSONB for flexibility)
  content JSONB NOT NULL,
  /*
  content structure:
  {
    "snapshot": "string - 2-3 sentence audience summary",
    "pain_points": [
      {
        "title": "string",
        "intensity": 1-5,
        "frequency": "string",
        "quote": "string",
        "post_ids": ["string"] // References to source posts
      }
    ],
    "language_patterns": [
      {
        "user_says": "string",
        "not_say": "string", 
        "context": "string"
      }
    ],
    "content_strategy": {
      "what_works": ["string"],
      "what_fails": ["string"],
      "best_times": {
        "days": ["string"],
        "hours": "string"
      }
    },
    "mentioned_products": [
      {
        "name": "string",
        "mentions": "string",
        "sentiment": "positive|mixed|negative|neutral"
      }
    ],
    "rules_summary": {
      "promo_allowed": boolean,
      "key_rules": ["string"],
      "enforcement_level": "strict|moderate|light"
    },
    "next_steps": ["string"],
    "metadata": {
      "posts_analyzed": number,
      "comments_analyzed": number,
      "date_range": "string"
    }
  }
  */
  
  -- Generation metadata
  model_version TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INT,
  generation_time_ms INT,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  
  -- Cache management
  is_cached BOOLEAN DEFAULT FALSE, -- True if this is a shared/cached brief
  cache_expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX briefs_user_id_idx ON audience_briefs(user_id);
CREATE INDEX briefs_subreddit_id_idx ON audience_briefs(subreddit_id);
CREATE INDEX briefs_created_at_idx ON audience_briefs(created_at DESC);
CREATE INDEX briefs_cached_idx ON audience_briefs(is_cached, subreddit_id) WHERE is_cached = TRUE;

-- RLS
ALTER TABLE audience_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefs" ON audience_briefs
  FOR SELECT USING (auth.uid() = user_id OR is_cached = TRUE);

CREATE POLICY "Users can create own briefs" ON audience_briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs" ON audience_briefs
  FOR DELETE USING (auth.uid() = user_id);
```

### Discovery Sessions

```sql
-- Track subreddit discovery sessions
CREATE TABLE discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Input
  product_description TEXT NOT NULL,
  target_audience TEXT,
  
  -- Results
  discovered_subreddits JSONB NOT NULL DEFAULT '[]',
  /*
  [
    {
      "subreddit_id": "string",
      "relevance_score": 0-100,
      "reasoning": "string",
      "audience_overlap": "high|medium|low"
    }
  ]
  */
  
  -- Metadata
  model_version TEXT,
  tokens_used INT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX discovery_user_id_idx ON discovery_sessions(user_id);
CREATE INDEX discovery_created_at_idx ON discovery_sessions(created_at DESC);

-- RLS
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON discovery_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON discovery_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Tracked Subreddits (Monitoring)

```sql
-- Subreddits user is monitoring
CREATE TABLE tracked_subreddits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subreddit_id TEXT REFERENCES subreddits(id),
  
  -- Tracking settings
  keywords TEXT[], -- Keywords to match in posts
  include_comments BOOLEAN DEFAULT FALSE,
  min_intent_score INT DEFAULT 0, -- 0-100, 0 = all posts
  
  -- Notification settings
  notify_email BOOLEAN DEFAULT TRUE,
  notify_digest BOOLEAN DEFAULT TRUE, -- Include in daily digest
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ,
  last_post_id TEXT, -- Track where we left off
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, subreddit_id)
);

-- Indexes
CREATE INDEX tracked_user_id_idx ON tracked_subreddits(user_id);
CREATE INDEX tracked_active_idx ON tracked_subreddits(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE tracked_subreddits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tracked subreddits" ON tracked_subreddits
  FOR ALL USING (auth.uid() = user_id);
```

### Matched Posts (from monitoring)

```sql
-- Posts that matched user's tracking criteria
CREATE TABLE matched_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tracked_subreddit_id UUID REFERENCES tracked_subreddits(id) ON DELETE CASCADE,
  
  -- Post data
  post_id TEXT NOT NULL, -- Reddit post ID
  subreddit_id TEXT NOT NULL,
  title TEXT NOT NULL,
  selftext TEXT,
  url TEXT,
  author TEXT,
  score INT,
  num_comments INT,
  created_utc TIMESTAMPTZ,
  permalink TEXT,
  
  -- Analysis
  intent_score INT, -- 0-100
  intent_label TEXT, -- 'problem_aware', 'solution_seeking', 'purchase_ready'
  matched_keywords TEXT[],
  
  -- User interaction
  is_read BOOLEAN DEFAULT FALSE,
  is_saved BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

-- Indexes
CREATE INDEX matched_user_id_idx ON matched_posts(user_id);
CREATE INDEX matched_unread_idx ON matched_posts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX matched_intent_idx ON matched_posts(intent_score DESC);

-- RLS
ALTER TABLE matched_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own matched posts" ON matched_posts
  FOR ALL USING (auth.uid() = user_id);
```

### Payments (Dodo)

```sql
-- Payment events from Dodo webhooks
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Dodo data
  dodo_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL, -- 'subscription.created', 'subscription.canceled', etc.
  payload JSONB NOT NULL,
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for processing
CREATE INDEX payment_events_unprocessed_idx ON payment_events(processed) WHERE processed = FALSE;
```

## Database Functions

```sql
-- Reset monthly usage (called by cron job)
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
  
  -- Pro users have unlimited (-1)
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
```

## Migrations

Migrations are managed via Supabase CLI. Run:

```bash
# Create new migration
npx supabase migration new <migration_name>

# Apply migrations locally
npx supabase db reset

# Push to production
npx supabase db push
```

## Seed Data

Top 50 subreddits for founders/indie hackers are seeded via migration `005_seed_subreddits.sql`.
Run `npx supabase db push` to apply.
