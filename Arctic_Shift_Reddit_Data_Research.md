# Arctic Shift Reddit Archive for audience intelligence

**Arctic Shift is the most complete publicly available Reddit archive, containing ~1.8 billion posts and comments from 2005 through February 2026, accessible via a free REST API, Hugging Face Parquet dataset, and per-subreddit torrent downloads.** This makes it the ideal data source for a Reddit Audience Intelligence prototype. The API requires no authentication, supports subreddit/author/date filtering with full-text search, and returns JSON — meaning a working prototype can be built in hours, not weeks. Below is everything needed to build it: complete schemas, working code, API endpoints, and the five best subreddits for validation.

---

## Part 1: Three ways to access Arctic Shift data

Arctic Shift offers three primary access methods, each suited to different use cases. For a prototype, the **REST API** is the fastest path to working code. For production-scale analysis, the **Hugging Face Parquet dataset** or **torrent downloads** are more appropriate.

### 1.1 REST API (best for prototyping)

The API lives at `https://arctic-shift.photon-reddit.com` and requires **no authentication**. Rate limits are soft — a few requests per second is fine. Check `X-RateLimit-Remaining` and `X-RateLimit-Reset` response headers. There is no uptime SLA (this is a community project by a single developer).

**Core endpoints:**

| Endpoint | Purpose |
|---|---|
| `/api/posts/search` | Search/filter submissions |
| `/api/comments/search` | Search/filter comments |
| `/api/comments/tree` | Get threaded comment tree for a post |
| `/api/posts/ids` | Lookup posts by ID (up to 500) |
| `/api/comments/ids` | Lookup comments by ID (up to 500) |
| `/api/subreddits/search` | Search subreddit metadata |
| `/api/subreddits/rules` | Get subreddit rules |
| `/api/subreddits/wikis` | Get subreddit wiki content |
| `/api/posts/search/aggregate` | Aggregate post data (by time, author, subreddit) |
| `/api/comments/search/aggregate` | Aggregate comment data |
| `/api/users/interactions/subreddits` | User activity across subreddits |
| `/api/time_series` | Historical metrics (subscriber counts, post volume) |

**Key query parameters** shared across search endpoints: `subreddit`, `author`, `after`, `before` (dates accept ISO 8601, epoch seconds, or relative like `30d`), `limit` (1–100, or `"auto"` for 100–1000), `sort` (`asc`/`desc` by `created_utc`), `fields` (comma-separated field selection), and `md2html` (boolean, generates HTML from markdown).

**Critical limitation:** Full-text search on `title`, `selftext`, and `body` fields **requires** at least one of `subreddit`, `author`, `link_id`, or `parent_id`. Standalone keyword search across all of Reddit is not supported.

**Pagination** uses date-based cursoring: sort ascending by `created_utc`, take the timestamp of the last result, and pass it as `after` for the next page.

### 1.2 Hugging Face Parquet dataset (best for batch analysis)

**Dataset:** `open-index/arctic` at `https://huggingface.co/datasets/open-index/arctic`

This is a third-party repackaging of Arctic Shift's monthly dumps into **Zstandard-compressed Parquet files**, organized by `data/{comments,submissions}/YYYY/MM/NNN.parquet`. As of April 2026, it contains **~1.2 billion submissions and ~615 million comments** across **202 GB** of compressed Parquet. The ingestion pipeline is ~44% complete (215 of 486 month/type pairs), with an ETA around April 25, 2026.

Data is organized **by date, not by subreddit**. To analyze a specific subreddit, you load monthly shards and filter rows. Two named configurations exist: `comments` and `submissions`. Files target ~200 MB per shard with 131K-row row groups.

### 1.3 Direct torrent downloads (best for subreddit-specific bulk data)

**Per-subreddit dumps** are the most efficient option for focused analysis:

- **Top 40K subreddits (2005–2024):** `https://academictorrents.com/details/1614740ac8c94505e4ecb9d88be8bed7b6afddd4` — separate Zstandard-compressed NDJSON files per subreddit, so you can selectively download only the ones you need
- **Monthly dumps** published to Academic Torrents each month (RS_YYYY-MM.zst for submissions, RC_YYYY-MM.zst for comments)
- **Subreddit metadata dump** with 22 million subreddits, 345K with rules, 323K wiki pages: `https://academictorrents.com/details/5d0bf258a025a5b802572ddc29cde89bf093185c`

**Web-based download tool** at `https://arctic-shift.photon-reddit.com/download-tool` allows downloading all posts/comments for a specific subreddit or user with date range filtering, exported as JSONL. Best for small-to-medium subreddits.

---

## Part 2: Complete data schemas

### Posts (submissions)

| Field | Type | Always Present | Description |
|---|---|---|---|
| `id` | string | ✅ | Base-36 post ID (e.g., "sphocx") |
| `author` | string | ✅ | Username; "[deleted]" if account removed |
| `subreddit` | string | ✅ | Subreddit name without r/ prefix |
| `title` | string | ✅ | Post title |
| `selftext` | string | ✅ | Body text; empty string for link posts |
| `score` | integer | ✅ | Net upvotes at archive time (~36h after posting) |
| `num_comments` | integer | ✅ | Comment count at archive time |
| `created_utc` | integer | ✅ | Unix timestamp of creation |
| `url` | string | ✅ | External URL or self-post permalink |
| `over_18` | boolean | ✅ | NSFW flag |
| `permalink` | string | ✅ | Relative URL path |
| `is_self` | boolean | ✅ | Whether it's a text post |
| `subreddit_id` | string | ✅ | Subreddit fullname (e.g., "t5_2qh1i") |
| `author_fullname` | string | ❌ | Reddit fullname (e.g., "t2_xxxxx") |
| `distinguished` | string/null | ❌ | "moderator", "admin", or null |
| `link_flair_text` | string/null | ❌ | Post flair text |
| `author_flair_text` | string/null | ❌ | Author's subreddit flair |
| `post_hint` | string/null | ❌ | Content type ("image", "link", "self") |
| `spoiler` | boolean | ❌ | Spoiler flag |
| `stickied` | boolean | ❌ | Whether pinned in subreddit |
| `crosspost_parent` | string/null | ❌ | ID of crosspost source |
| `retrieved_on` | integer | ❌ | Unix timestamp of archival |

**Sample post object:**
```json
{
  "id": "sphocx",
  "author": "techfounder42",
  "subreddit": "SaaS",
  "title": "Hit $5K MRR after 6 months - here's what worked",
  "selftext": "After launching my SaaS in July...",
  "score": 247,
  "num_comments": 89,
  "created_utc": 1707350400,
  "url": "https://www.reddit.com/r/SaaS/comments/sphocx/",
  "over_18": false,
  "permalink": "/r/SaaS/comments/sphocx/hit_5k_mrr_after_6_months/",
  "is_self": true,
  "link_flair_text": "Milestone",
  "distinguished": null
}
```

### Comments

| Field | Type | Always Present | Description |
|---|---|---|---|
| `id` | string | ✅ | Base-36 comment ID |
| `author` | string | ✅ | Username |
| `subreddit` | string | ✅ | Subreddit name |
| `body` | string | ✅ | Comment text in markdown; "[removed]" if mod-removed |
| `score` | integer | ✅ | Net upvotes at archive time |
| `created_utc` | integer | ✅ | Unix timestamp |
| `link_id` | string | ✅ | Parent post ID with **`t3_` prefix** |
| `parent_id` | string | ✅ | `t3_` prefix = top-level reply; `t1_` prefix = reply to comment |
| `subreddit_id` | string | ✅ | Subreddit fullname |
| `author_fullname` | string | ❌ | Reddit fullname |
| `distinguished` | string/null | ❌ | "moderator", "admin", or null |
| `author_flair_text` | string/null | ❌ | Author's flair |
| `stickied` | boolean | ❌ | Whether pinned |
| `edited` | bool/float | ❌ | false or Unix timestamp of edit |
| `retrieved_on` | integer | ❌ | Archive timestamp |

**Comment-to-post linking:** Strip the `t3_` prefix from `link_id` to get the post's `id`. A comment with `parent_id` starting with `t3_` is a top-level comment; `t1_` means it's a reply to another comment (strip prefix to get parent comment's `id`).

### Subreddit metadata

| Field | Type | Description |
|---|---|---|
| `display_name` | string | Subreddit name |
| `title` | string | Display title |
| `description` | string | Sidebar text (markdown) |
| `public_description` | string | Short description shown in search |
| `subscribers` | integer | Subscriber count at retrieval time |
| `created_utc` | float | Creation timestamp |
| `over18` | boolean | NSFW flag |
| `id` | string | Subreddit ID |

The metadata dump covers **22 million subreddits** with about pages, **345K with posting rules**, and **323K wiki pages**. Rules and wikis are available via `/api/subreddits/rules` and `/api/subreddits/wikis` endpoints.

---

## Part 3: Query patterns for the prototype

### Fetching subreddit posts

**Get the 100 most recent posts from r/SaaS:**
```
GET https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=SaaS&sort=desc&limit=100
```

**Get posts from the last 12 months, paginated:**
```
GET /api/posts/search?subreddit=SaaS&after=2025-04-16&before=2026-04-16&sort=asc&limit=100
```
Take the `created_utc` of the last result and pass it as `after` for the next page. Repeat until fewer results than `limit` are returned.

**Search posts by keyword within a subreddit:**
```
GET /api/posts/search?subreddit=SaaS&query=churn+retention&sort=desc&limit=100
```
The `query` parameter searches both `title` and `selftext`. Keyword syntax supports: `word1 word2` (AND), `"phrase match"` (ordered), `word1 OR word2`, `word1 -word2` (NOT).

**Aggregate post volume over time:**
```
GET /api/posts/search/aggregate?subreddit=SaaS&aggregate=created_utc&frequency=month&after=2025-01-01
```

### Fetching comments

**Get the full comment tree for a post:**
```
GET /api/comments/tree?link_id=sphocx&limit=9999
```
This returns a hierarchical tree structure. Setting `limit=9999` returns all comments. The `start_breadth` and `start_depth` parameters control collapsing of deep/wide threads (defaults: 4 each). Collapsed branches return `"kind": "more"` with a `children` array.

**Get all comments from a subreddit in a date range:**
```
GET /api/comments/search?subreddit=SaaS&after=2026-03-01&before=2026-04-01&sort=asc&limit=100
```

**Get comments by a specific author:**
```
GET /api/comments/search?author=techfounder42&sort=desc&limit=100
```

### Searching across subreddits

Full-text search **always requires** a `subreddit`, `author`, `link_id`, or `parent_id` constraint. To search across multiple subreddits, make separate requests per subreddit and merge results client-side. For cross-Reddit discovery, use the aggregation endpoints:

```
GET /api/posts/search/aggregate?aggregate=subreddit&query=audience+intelligence&after=2025-01-01
```

This returns subreddit-level counts for posts matching the query, helping identify where a topic is discussed most.

---

## Part 4: Five best subreddits for validation

After evaluating nine candidate communities across relevance, promo tolerance, activity level, size manageability, and dogfooding potential, these five rise to the top for validating a Reddit Audience Intelligence tool.

### r/SaaS (~400K subscribers) ranks first for audience density

This is the single best subreddit for validation. The community is **densely packed with SaaS founders and operators** discussing growth, retention, pricing, churn, and MRR milestones — exactly the audience a Reddit intelligence tool serves. Activity is high with dozens of posts daily across categories: advice requests, solution requests, pain points, and revenue milestones. Self-promotion is tolerated when framed as sharing progress, and dedicated weekly "Share Your SaaS" feedback threads explicitly welcome it. The subreddit is large enough for statistically meaningful analysis (~400K subscribers) but not so massive that signal drowns in noise. **Dogfooding is natural**: posting an analysis of r/SaaS pain points using your own tool would be genuinely valuable content. Estimated **20–30 posts per day** with strong comment engagement.

### r/indiehackers (~130–150K subscribers) is the most precisely aligned audience

This community IS the target user base. Every member is an indie hacker, bootstrapped founder, or solopreneur sharing revenue milestones, growth experiments, and honest post-mortems. Content quality is high with an emphasis on transparency and building in public. The community allows **one self-promotional post per user** using the "SHOW IH" flair, which must be for feedback rather than marketing. At ~130K subscribers, it's perfectly sized for comprehensive analysis. **Dogfooding play**: "I analyzed 1,000 r/indiehackers posts to find the top pain points founders face" would be extremely well-received. The one-post promotional limit makes it slightly less flexible for ongoing dogfooding than r/SaaS.

### r/SideProject (~440K subscribers) offers the most permissive promotion rules

The **most promo-friendly subreddit** on this list — its entire purpose is for people to showcase projects and get feedback. Self-promotion is explicitly welcome when seeking feedback, with appropriate flairs. The audience overlaps significantly with indie hackers and founders, though it skews slightly more casual (side projects vs. full-time ventures). This is the safest place to launch and iterate on the tool publicly. Strong engagement on launches, demos, and progress updates. Estimated **15–25 posts per day**.

### r/microsaas (~50–155K subscribers) provides the tightest product-market fit

A Reddit Audience Intelligence tool IS a micro SaaS product, making this community meta-relevant. Discussions are highly tactical: pricing strategies, growth stories, first-customer acquisition, and product decisions for small SaaS businesses. The community is **more accepting of promotional content** than most, expecting founders to share what they're building. Smaller size means less data volume but a much higher signal-to-noise ratio. Two variants exist (r/microsaas and r/micro_saas) — verify which is more active before committing.

### r/buildinpublic (~40–55K subscribers) is ideal for journey documentation

The entire concept of this subreddit is sharing your building journey publicly, making self-promotion the norm rather than the exception. Revenue milestones, build logs, AMAs, and launch stories get strong engagement. The community directly mirrors the build-in-public movement on X/Twitter. While it's the smallest of the five (~40–55K), the audience quality is excellent and engagement per post is high. **Best used alongside one of the larger subreddits** for ongoing journey updates while running deeper analysis on r/SaaS or r/indiehackers.

**Why the others didn't make the cut:** r/Entrepreneur (4.8M) and r/startups (2M) are too large, too strictly moderated against promotion, and too diluted with non-target audiences. r/marketing (1.9M) has zero tolerance for self-promotion and targets professional marketers, not founders. r/GrowthHacking (~200K) focuses on marketing tactics rather than product building.

---

## Part 5: Working code examples

### 5.1 Arctic Shift API client in Python

```python
"""
arctic_shift_client.py — Production-ready client for the Arctic Shift API.
"""

import time
import requests
from datetime import datetime, timedelta
from typing import Generator


BASE_URL = "https://arctic-shift.photon-reddit.com"


class ArcticShiftClient:
    def __init__(self, requests_per_second: float = 2.0):
        self.session = requests.Session()
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0

    def _get(self, endpoint: str, params: dict) -> dict:
        """Rate-limited GET request."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)

        url = f"{BASE_URL}{endpoint}"
        resp = self.session.get(url, params=params, timeout=30)
        self.last_request_time = time.time()
        resp.raise_for_status()
        return resp.json()

    def search_posts(self, subreddit: str, after: str = None,
                     before: str = None, query: str = None,
                     limit: int = 100, sort: str = "desc",
                     fields: str = None) -> list[dict]:
        """Search posts in a subreddit."""
        params = {"subreddit": subreddit, "limit": limit, "sort": sort}
        if after:
            params["after"] = after
        if before:
            params["before"] = before
        if query:
            params["query"] = query
        if fields:
            params["fields"] = fields
        result = self._get("/api/posts/search", params)
        return result.get("data", [])

    def search_comments(self, subreddit: str = None, link_id: str = None,
                        author: str = None, after: str = None,
                        before: str = None, body: str = None,
                        limit: int = 100, sort: str = "desc") -> list[dict]:
        """Search comments with various filters."""
        params = {"limit": limit, "sort": sort}
        if subreddit:
            params["subreddit"] = subreddit
        if link_id:
            params["link_id"] = link_id
        if author:
            params["author"] = author
        if after:
            params["after"] = after
        if before:
            params["before"] = before
        if body:
            params["body"] = body
        result = self._get("/api/comments/search", params)
        return result.get("data", [])

    def get_comment_tree(self, post_id: str, limit: int = 9999) -> dict:
        """Get full threaded comment tree for a post."""
        params = {"link_id": post_id, "limit": limit}
        return self._get("/api/comments/tree", params)

    def get_posts_by_ids(self, ids: list[str],
                         fields: str = None) -> list[dict]:
        """Lookup up to 500 posts by ID."""
        params = {"ids": ",".join(ids[:500])}
        if fields:
            params["fields"] = fields
        result = self._get("/api/posts/ids", params)
        return result.get("data", [])

    def get_subreddit_info(self, subreddit: str) -> list[dict]:
        """Get subreddit metadata."""
        params = {"subreddit": subreddit}
        result = self._get("/api/subreddits/search", params)
        return result.get("data", [])

    def get_subreddit_rules(self, subreddit: str) -> dict:
        """Get subreddit rules."""
        params = {"subreddits": subreddit}
        return self._get("/api/subreddits/rules", params)

    def aggregate_posts(self, subreddit: str, aggregate: str = "created_utc",
                        frequency: str = "month", after: str = None,
                        before: str = None) -> list[dict]:
        """Get aggregated post stats."""
        params = {
            "subreddit": subreddit,
            "aggregate": aggregate,
            "frequency": frequency,
        }
        if after:
            params["after"] = after
        if before:
            params["before"] = before
        result = self._get("/api/posts/search/aggregate", params)
        return result.get("data", [])

    def paginate_posts(self, subreddit: str, after: str,
                       before: str = None, query: str = None,
                       limit: int = 100) -> Generator[dict, None, None]:
        """
        Yield ALL posts in a date range using date-based pagination.
        Automatically pages through results using created_utc cursoring.
        """
        current_after = after
        while True:
            posts = self.search_posts(
                subreddit=subreddit,
                after=current_after,
                before=before,
                query=query,
                limit=limit,
                sort="asc",
            )
            if not posts:
                break
            for post in posts:
                yield post
            # Use last post's timestamp as cursor for next page
            current_after = str(posts[-1]["created_utc"])
            if len(posts) < limit:
                break
```

### 5.2 End-to-end data extraction pipeline

```python
"""
pipeline.py — Fetch subreddit data from Arctic Shift, structure for
Claude API analysis, and save to local JSON or Supabase.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# pip install anthropic supabase
from anthropic import Anthropic

# Import the client from above
from arctic_shift_client import ArcticShiftClient


def fetch_subreddit_data(
    subreddit: str,
    days_back: int = 30,
    max_posts: int = 200,
    fetch_comments: bool = True,
    max_comments_per_post: int = 50,
) -> dict:
    """
    Fetch posts and comments from a subreddit via Arctic Shift API.
    Returns structured data ready for analysis.
    """
    client = ArcticShiftClient(requests_per_second=2.0)
    after_date = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    # Fetch posts
    print(f"Fetching posts from r/{subreddit} (last {days_back} days)...")
    posts = []
    for post in client.paginate_posts(subreddit=subreddit, after=after_date):
        posts.append(post)
        if len(posts) >= max_posts:
            break
    print(f"  Got {len(posts)} posts")

    # Fetch comments for each post
    enriched_posts = []
    for i, post in enumerate(posts):
        post_data = {
            "id": post["id"],
            "title": post.get("title", ""),
            "selftext": post.get("selftext", ""),
            "author": post.get("author", "[deleted]"),
            "score": post.get("score", 0),
            "num_comments": post.get("num_comments", 0),
            "created_utc": post.get("created_utc"),
            "url": post.get("url", ""),
            "link_flair_text": post.get("link_flair_text"),
            "comments": [],
        }

        if fetch_comments and post.get("num_comments", 0) > 0:
            try:
                tree = client.get_comment_tree(
                    post["id"], limit=max_comments_per_post
                )
                comments = flatten_comment_tree(tree)
                post_data["comments"] = comments[:max_comments_per_post]
            except Exception as e:
                print(f"  Warning: Failed to fetch comments for {post['id']}: {e}")

        enriched_posts.append(post_data)
        if (i + 1) % 10 == 0:
            print(f"  Processed {i + 1}/{len(posts)} posts...")

    # Get subreddit metadata
    sub_info = client.get_subreddit_info(subreddit)
    metadata = sub_info[0] if sub_info else {}

    return {
        "subreddit": subreddit,
        "fetch_date": datetime.utcnow().isoformat(),
        "days_back": days_back,
        "total_posts": len(enriched_posts),
        "subreddit_metadata": metadata,
        "posts": enriched_posts,
    }


def flatten_comment_tree(tree: dict, depth: int = 0) -> list[dict]:
    """Recursively flatten a comment tree into a list with depth info."""
    comments = []
    for item in tree.get("data", tree.get("children", [])):
        if isinstance(item, dict) and item.get("kind") != "more":
            comments.append({
                "id": item.get("id", ""),
                "author": item.get("author", "[deleted]"),
                "body": item.get("body", ""),
                "score": item.get("score", 0),
                "depth": depth,
                "parent_id": item.get("parent_id", ""),
                "created_utc": item.get("created_utc"),
            })
            # Recurse into replies
            if "children" in item:
                comments.extend(flatten_comment_tree(item, depth + 1))
            if "replies" in item and isinstance(item["replies"], dict):
                comments.extend(
                    flatten_comment_tree(item["replies"], depth + 1)
                )
    return comments


# ── Save to local JSON ────────────────────────────────────────────────

def save_to_json(data: dict, output_dir: str = "./data") -> str:
    """Save fetched data to a local JSON file."""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    filename = f"{data['subreddit']}_{data['fetch_date'][:10]}.json"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"Saved to {filepath} ({os.path.getsize(filepath) / 1024:.1f} KB)")
    return filepath


# ── Save to Supabase ──────────────────────────────────────────────────

def save_to_supabase(data: dict, supabase_url: str, supabase_key: str):
    """
    Save posts and comments to Supabase tables.
    Requires tables: reddit_posts, reddit_comments (see schema below).
    """
    from supabase import create_client

    sb = create_client(supabase_url, supabase_key)

    # Upsert posts
    post_rows = []
    for post in data["posts"]:
        post_rows.append({
            "id": post["id"],
            "subreddit": data["subreddit"],
            "title": post["title"],
            "selftext": post["selftext"][:10000],  # Supabase text limit
            "author": post["author"],
            "score": post["score"],
            "num_comments": post["num_comments"],
            "created_utc": post["created_utc"],
            "url": post["url"],
            "link_flair_text": post.get("link_flair_text"),
            "fetched_at": data["fetch_date"],
        })
    sb.table("reddit_posts").upsert(post_rows).execute()
    print(f"Upserted {len(post_rows)} posts to Supabase")

    # Upsert comments
    comment_rows = []
    for post in data["posts"]:
        for comment in post["comments"]:
            comment_rows.append({
                "id": comment["id"],
                "post_id": post["id"],
                "subreddit": data["subreddit"],
                "author": comment["author"],
                "body": comment["body"][:10000],
                "score": comment["score"],
                "depth": comment["depth"],
                "parent_id": comment["parent_id"],
                "created_utc": comment["created_utc"],
                "fetched_at": data["fetch_date"],
            })
    # Batch insert in chunks of 500
    for i in range(0, len(comment_rows), 500):
        batch = comment_rows[i : i + 500]
        sb.table("reddit_comments").upsert(batch).execute()
    print(f"Upserted {len(comment_rows)} comments to Supabase")


# ── Supabase table creation SQL ───────────────────────────────────────

SUPABASE_SCHEMA_SQL = """
-- Run this in Supabase SQL editor
CREATE TABLE IF NOT EXISTS reddit_posts (
    id TEXT PRIMARY KEY,
    subreddit TEXT NOT NULL,
    title TEXT,
    selftext TEXT,
    author TEXT,
    score INTEGER DEFAULT 0,
    num_comments INTEGER DEFAULT 0,
    created_utc BIGINT,
    url TEXT,
    link_flair_text TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    analysis JSONB  -- Store Claude analysis results here
);

CREATE TABLE IF NOT EXISTS reddit_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES reddit_posts(id),
    subreddit TEXT NOT NULL,
    author TEXT,
    body TEXT,
    score INTEGER DEFAULT 0,
    depth INTEGER DEFAULT 0,
    parent_id TEXT,
    created_utc BIGINT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_subreddit ON reddit_posts(subreddit);
CREATE INDEX idx_posts_created ON reddit_posts(created_utc);
CREATE INDEX idx_comments_post ON reddit_comments(post_id);
CREATE INDEX idx_comments_subreddit ON reddit_comments(subreddit);
"""


# ── Claude API analysis ──────────────────────────────────────────────

def analyze_with_claude(
    data: dict,
    analysis_type: str = "audience_intelligence",
    model: str = "claude-sonnet-4-20250514",
) -> dict:
    """
    Send subreddit data to Claude for audience intelligence analysis.
    Batches posts into chunks that fit within context limits.
    """
    client = Anthropic()  # Uses ANTHROPIC_API_KEY env var

    # Prepare condensed post summaries to maximize context usage
    post_summaries = []
    for post in data["posts"][:100]:  # Limit to 100 posts per batch
        summary = {
            "title": post["title"],
            "selftext": post["selftext"][:500],  # Truncate long posts
            "score": post["score"],
            "num_comments": post["num_comments"],
            "flair": post.get("link_flair_text", ""),
            "top_comments": [
                c["body"][:200] for c in post.get("comments", [])[:5]
            ],
        }
        post_summaries.append(summary)

    prompts = {
        "audience_intelligence": """Analyze these Reddit posts from r/{subreddit} and provide:

1. **Top 5 Pain Points**: What problems do people discuss most? Rank by frequency and intensity.
2. **Top 5 Topics/Themes**: Recurring discussion themes with estimated frequency.
3. **Tool/Product Mentions**: What tools, products, or services are mentioned? Sentiment for each.
4. **Audience Profile**: Demographics, experience level, goals, common language patterns.
5. **Content Opportunities**: What questions go unanswered? What content would this audience value?
6. **Sentiment Overview**: Overall community mood, frustrations, excitement areas.

Be specific — cite post titles and quote comment snippets as evidence.
Return your analysis as structured JSON.""",

        "competitor_analysis": """Analyze these Reddit posts from r/{subreddit} to identify:

1. **Tools/Products Mentioned**: Every tool, SaaS, or product mentioned with sentiment and frequency.
2. **Complaints About Existing Tools**: What do people hate about current solutions?
3. **Feature Requests**: What capabilities do people wish existed?
4. **Switching Triggers**: What causes people to switch from one tool to another?
5. **Price Sensitivity**: Discussions about pricing, willingness to pay.

Return structured JSON with evidence (post titles, comment quotes).""",
    }

    prompt_template = prompts.get(analysis_type, prompts["audience_intelligence"])

    message = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": prompt_template.format(subreddit=data["subreddit"])
                       + "\n\nPosts data:\n"
                       + json.dumps(post_summaries, indent=1),
        }],
    )

    return {
        "subreddit": data["subreddit"],
        "analysis_type": analysis_type,
        "result": message.content[0].text,
        "posts_analyzed": len(post_summaries),
        "model": model,
    }


# ── Main execution ────────────────────────────────────────────────────

if __name__ == "__main__":
    # Step 1: Fetch data
    data = fetch_subreddit_data(
        subreddit="SaaS",
        days_back=30,
        max_posts=100,
        fetch_comments=True,
        max_comments_per_post=20,
    )

    # Step 2: Save locally
    save_to_json(data)

    # Step 3: Analyze with Claude (requires ANTHROPIC_API_KEY env var)
    # analysis = analyze_with_claude(data, analysis_type="audience_intelligence")
    # print(json.dumps(analysis, indent=2))

    # Step 4: Save to Supabase (optional)
    # save_to_supabase(data, os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
```

### 5.3 Hugging Face dataset loading for batch analysis

```python
"""
huggingface_loader.py — Load Arctic Shift data from Hugging Face for
bulk/historical analysis when the API is too slow.
"""

from datasets import load_dataset
import pandas as pd


# ── Method 1: Stream a specific month (memory-efficient) ─────────────

def stream_month(year: int, month: int, data_type: str = "submissions",
                 subreddit_filter: str = None):
    """Stream records from a specific month without downloading everything."""
    pattern = f"data/{data_type}/{year}/{month:02d}/*.parquet"
    stream = load_dataset(
        "open-index/arctic",
        data_files=pattern,
        split="train",
        streaming=True,
    )
    for record in stream:
        if subreddit_filter and record["subreddit"] != subreddit_filter:
            continue
        yield record


# ── Method 2: Load a month into pandas ───────────────────────────────

def load_month_pandas(year: int, month: int,
                      data_type: str = "submissions",
                      subreddit: str = None) -> pd.DataFrame:
    """Load a full month into a pandas DataFrame."""
    path = f"hf://datasets/open-index/arctic/data/{data_type}/{year}/{month:02d}/"
    df = pd.read_parquet(path)
    if subreddit:
        df = df[df["subreddit"] == subreddit]
    return df


# ── Method 3: DuckDB for SQL queries (fastest for analytics) ─────────

def query_with_duckdb(sql: str):
    """Run SQL directly against Hugging Face Parquet files with DuckDB."""
    import duckdb
    conn = duckdb.connect()
    # Install and load httpfs for remote parquet access
    conn.execute("INSTALL httpfs; LOAD httpfs;")
    return conn.execute(sql).fetchdf()


# Example: Top pain-point posts in r/SaaS for 2025
EXAMPLE_QUERY = """
SELECT id, title, selftext, score, num_comments, created_at
FROM read_parquet(
    'hf://datasets/open-index/arctic/data/submissions/2025/**/*.parquet'
)
WHERE subreddit = 'SaaS'
  AND (title ILIKE '%pain%' OR title ILIKE '%struggle%'
       OR title ILIKE '%problem%' OR title ILIKE '%hate%')
  AND score > 5
ORDER BY score DESC
LIMIT 50;
"""


# ── Method 4: Selective download with huggingface_hub ─────────────────

def download_specific_months(year: int, months: list[int],
                             data_type: str = "submissions",
                             output_dir: str = "./arctic_data"):
    """Download specific months to local disk for repeated analysis."""
    from huggingface_hub import snapshot_download

    patterns = [
        f"data/{data_type}/{year}/{m:02d}/*" for m in months
    ]
    snapshot_download(
        "open-index/arctic",
        repo_type="dataset",
        local_dir=output_dir,
        allow_patterns=patterns,
    )
    print(f"Downloaded {len(patterns)} month(s) to {output_dir}")


# ── Usage examples ────────────────────────────────────────────────────

if __name__ == "__main__":
    # Stream January 2025 submissions, filtering for r/SaaS
    print("Streaming r/SaaS posts from Jan 2025...")
    count = 0
    for post in stream_month(2025, 1, "submissions", subreddit_filter="SaaS"):
        print(f"  [{post['score']:>4}] {post['title'][:80]}")
        count += 1
        if count >= 10:
            break

    # Load into pandas for analysis
    # df = load_month_pandas(2025, 1, "submissions", subreddit="SaaS")
    # print(f"Got {len(df)} posts from r/SaaS in Jan 2025")

    # DuckDB SQL query
    # results = query_with_duckdb(EXAMPLE_QUERY)
    # print(results.head(10))
```

---

## Gotchas, limitations, and production considerations

**Scores are snapshots, not live values.** Arctic Shift captures scores approximately 36 hours after posting. Initial captures show score=1 and num_comments=0. For recent data (less than ~36 hours old), these fields are unreliable. Plan your pipeline to fetch data that's at least 2 days old for accurate engagement metrics.

**The API is a one-person community project** with no SLA. For production workloads, use the API for real-time queries but maintain a local copy of target subreddit data (via torrent dumps or Hugging Face Parquet) as a fallback. The download tool at `https://arctic-shift.photon-reddit.com/download-tool` exports JSONL per subreddit — use this to seed your database.

**The Hugging Face dataset is ~44% ingested** as of April 2026, with many months from 2013–2022 (especially comments) still missing. If you need complete historical data for a specific subreddit, the **per-subreddit torrent** (top 40K subreddits, 2005–2024) is more reliable.

**Deleted and removed content** behaves asymmetrically. Content deleted before Arctic Shift's archival window is gone forever. Content deleted after capture may retain original text — `[removed]` indicates moderator action, `[deleted]` indicates user deletion. Be aware of ethical implications when analyzing content users chose to delete.

**Memory management for large subreddits** is critical. A single month of Reddit comments can exceed 10 GB uncompressed. Always use streaming (HuggingFace `streaming=True`) or DuckDB's lazy evaluation for exploratory work. Only load specific months into memory when you've confirmed the data volume is manageable.

## Conclusion

The optimal prototype architecture uses the **Arctic Shift REST API as the primary data source** — it requires zero setup, no authentication, and supports all the filtering needed for subreddit-level audience intelligence. The API's date-based pagination, comment tree endpoint, and aggregation capabilities cover every query pattern a prototype needs. For production scale, supplement with **Hugging Face Parquet files** loaded via DuckDB for historical batch analysis, and **per-subreddit torrent dumps** for complete archival data.

Start validation with **r/SaaS** (highest target audience density and engagement) and **r/indiehackers** (most precisely aligned users), using **r/SideProject** as the launch venue for the tool itself. The pipeline code above — API client, data extraction, Supabase storage, and Claude analysis — provides a working foundation that can go from zero to audience insights in a single afternoon.