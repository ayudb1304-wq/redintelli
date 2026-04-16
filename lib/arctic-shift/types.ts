export interface ArcticShiftPost {
  id: string;
  author: string;
  subreddit: string;
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  permalink: string;
  is_self: boolean;
  over_18: boolean;
  link_flair_text: string | null;
  distinguished: string | null;
}

export interface ArcticShiftComment {
  id: string;
  author: string;
  subreddit: string;
  body: string;
  score: number;
  created_utc: number;
  link_id: string;
  parent_id: string;
  distinguished: string | null;
}

export interface ArcticShiftSubredditMeta {
  num_posts: number;
  num_comments: number;
  earliest_post: number;
  earliest_comment: number;
  num_posts_updated_at?: number;
  num_comments_updated_at?: number;
}

export interface ArcticShiftSubreddit {
  id: string;
  display_name: string;
  title: string;
  description: string;
  public_description: string;
  subscribers: number;
  created_utc: number;
  over18: boolean;
  _meta?: ArcticShiftSubredditMeta;
}

export interface PostSearchOptions {
  limit?: number;
  after?: string;
  before?: string;
  query?: string;
  sort?: "asc" | "desc";
}

export interface CommentSearchOptions {
  limit?: number;
  after?: string;
  before?: string;
}

export interface SubredditSearchOptions {
  limit?: number;
}
