import Parser from "rss-parser";

interface FeedPost {
  id: string;
  title: string;
  link: string;
  pubDate: string | undefined;
}

const parser = new Parser();

function extractPostId(link: string): string {
  // Reddit links: https://www.reddit.com/r/sub/comments/POST_ID/slug/
  const match = link.match(/\/comments\/([a-z0-9]+)/i);
  return match?.[1] ?? link;
}

export async function parseSubredditFeed(
  subredditId: string
): Promise<FeedPost[]> {
  const feed = await parser.parseURL(
    `https://www.reddit.com/r/${subredditId}/new.rss`
  );

  return feed.items.map((item) => ({
    id: extractPostId(item.link ?? ""),
    title: item.title ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate,
  }));
}
