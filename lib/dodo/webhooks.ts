import crypto from "crypto";

export function verifyDodoWebhook(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) throw new Error("DODO_WEBHOOK_SECRET not set");

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export interface DodoWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
}

export function parseWebhookEvent(payload: string): DodoWebhookEvent {
  return JSON.parse(payload);
}
