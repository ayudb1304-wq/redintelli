import { ARCTIC_SHIFT_BASE_URL } from "@/lib/constants";
import type {
  ArcticShiftPost,
  ArcticShiftComment,
  ArcticShiftSubreddit,
  PostSearchOptions,
  CommentSearchOptions,
  SubredditSearchOptions,
} from "./types";

class ArcticShiftClient {
  private baseUrl = ARCTIC_SHIFT_BASE_URL;

  private async request<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(
        `Arctic Shift API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  async searchSubreddits(
    query: string,
    options: SubredditSearchOptions = {}
  ): Promise<ArcticShiftSubreddit[]> {
    const { limit = 25 } = options;

    const result = await this.request<{ data: ArcticShiftSubreddit[] }>(
      "/subreddits/search",
      { query, limit }
    );

    return result.data;
  }

  async getSubredditMetadata(
    subreddit: string
  ): Promise<ArcticShiftSubreddit | null> {
    const result = await this.request<{ data: ArcticShiftSubreddit[] }>(
      "/subreddits/search",
      { subreddit, limit: 1 }
    );

    return result.data[0] ?? null;
  }

  async getSubredditPosts(
    subreddit: string,
    options: PostSearchOptions = {}
  ): Promise<ArcticShiftPost[]> {
    const { limit = 100, after, before, query, sort = "desc" } = options;

    const result = await this.request<{ data: ArcticShiftPost[] }>(
      "/posts/search",
      { subreddit, limit, after, before, query, sort }
    );

    return result.data;
  }

  async getSubredditComments(
    subreddit: string,
    options: CommentSearchOptions = {}
  ): Promise<ArcticShiftComment[]> {
    const { limit = 100, after, before } = options;

    const result = await this.request<{ data: ArcticShiftComment[] }>(
      "/comments/search",
      { subreddit, limit, after, before, sort: "desc" }
    );

    return result.data;
  }

  async getCommentTree(
    linkId: string,
    limit: number = 500
  ): Promise<Record<string, unknown>> {
    return this.request("/comments/tree", { link_id: linkId, limit });
  }
}

export const arcticShift = new ArcticShiftClient();
