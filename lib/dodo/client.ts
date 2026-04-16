const DODO_API_URL = "https://api.dodopayments.com/v1";

interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSession {
  id: string;
  url: string;
  expires_at: string;
}

export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<CheckoutSession> {
  const response = await fetch(`${DODO_API_URL}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_email: options.userEmail,
      line_items: [
        {
          product: options.productId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        user_id: options.userId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create checkout session");
  }

  return response.json();
}

export async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `${DODO_API_URL}/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get subscription");
  }

  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch(
    `${DODO_API_URL}/subscriptions/${subscriptionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to cancel subscription");
  }

  return response.json();
}

export async function createCustomerPortalSession(customerId: string) {
  const response = await fetch(`${DODO_API_URL}/billing_portal/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create portal session");
  }

  return response.json();
}
