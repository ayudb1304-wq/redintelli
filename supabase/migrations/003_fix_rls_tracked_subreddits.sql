-- Fix tracked_subreddits RLS policy to allow inserts
DROP POLICY "Users can manage own tracked subreddits" ON tracked_subreddits;

CREATE POLICY "Users can manage own tracked subreddits" ON tracked_subreddits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
