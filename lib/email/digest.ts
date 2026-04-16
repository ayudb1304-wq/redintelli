import type { DigestContent } from "@/lib/claude/prompts/digest";

interface SendDigestOptions {
  to: string;
  digest: DigestContent;
}

export async function sendDigestEmail({ to, digest }: SendDigestOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set, skipping digest email");
    return;
  }

  const opportunitiesHtml = digest.top_opportunities
    .map(
      (opp) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <a href="https://reddit.com${opp.permalink}" style="color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 14px;">
            ${opp.post_title}
          </a>
          <div style="color: #666; font-size: 12px; margin-top: 4px;">
            r/${opp.subreddit} · Intent: ${opp.intent_score}/100
          </div>
          <div style="color: #444; font-size: 13px; margin-top: 6px;">
            ${opp.why_important}
          </div>
          <div style="color: #0066cc; font-size: 13px; margin-top: 4px;">
            → ${opp.suggested_action}
          </div>
        </td>
      </tr>`
    )
    .join("");

  const topicsHtml = digest.trending_topics
    .map(
      (topic) => `
      <li style="margin-bottom: 8px; font-size: 13px;">
        <strong>${topic.topic}</strong> (${topic.mention_count} mentions, ${topic.sentiment})
        <br/><span style="color: #666;">${topic.relevance}</span>
      </li>`
    )
    .join("");

  const competitorsHtml = digest.competitor_mentions
    .map(
      (comp) => `
      <li style="margin-bottom: 8px; font-size: 13px;">
        <strong>${comp.competitor}</strong>: ${comp.context}
        <br/><span style="color: #0066cc;">Opportunity: ${comp.opportunity}</span>
      </li>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 20px; margin-bottom: 4px;">RedIntelli Daily Digest</h1>
      <p style="color: #666; font-size: 14px; margin-top: 0;">${digest.headline}</p>

      <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #444;">
        ${digest.stats.total_posts_scanned} posts scanned · ${digest.stats.high_intent_posts} high-intent · ${digest.stats.subreddits_active} subreddits
      </div>

      <h2 style="font-size: 16px; margin-top: 24px;">Top Opportunities</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${opportunitiesHtml || '<tr><td style="color: #666; font-size: 13px;">No high-intent posts today.</td></tr>'}
      </table>

      ${
        topicsHtml
          ? `<h2 style="font-size: 16px; margin-top: 24px;">Trending Topics</h2>
             <ul style="padding-left: 20px;">${topicsHtml}</ul>`
          : ""
      }

      ${
        competitorsHtml
          ? `<h2 style="font-size: 16px; margin-top: 24px;">Competitor Mentions</h2>
             <ul style="padding-left: 20px;">${competitorsHtml}</ul>`
          : ""
      }

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        Sent by <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #999;">RedIntelli</a>.
        Manage your digest in <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #999;">settings</a>.
      </p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RedIntelli <digest@redintelli.com>",
      to,
      subject: `📊 ${digest.headline}`,
      html,
    }),
  });
}
