import crypto from "crypto";

export function verifyDodoWebhook(
  payload: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignature: string | null
): boolean {
  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) throw new Error("DODO_WEBHOOK_SECRET not set");

  // Standard Webhooks: sign "{webhook-id}.{webhook-timestamp}.{body}"
  const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;

  // Secret may be base64 encoded with "whsec_" prefix
  const secretBytes = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);

  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  // webhook-signature header can contain multiple signatures: "v1,<sig1> v1,<sig2>"
  const signatures = webhookSignature.split(" ");
  for (const sig of signatures) {
    const sigValue = sig.split(",").slice(1).join(",");
    try {
      if (
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(sigValue)
        )
      ) {
        return true;
      }
    } catch {
      // Length mismatch, try next
    }
  }

  return false;
}

export interface DodoWebhookEvent {
  business_id: string;
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export function parseWebhookEvent(payload: string): DodoWebhookEvent {
  return JSON.parse(payload);
}
