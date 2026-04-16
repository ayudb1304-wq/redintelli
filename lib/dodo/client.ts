function getDodoUrl() {
  return process.env.DODO_TEST_MODE === "true"
    ? "https://test.dodopayments.com"
    : "https://live.dodopayments.com";
}

interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSession {
  checkout_url: string;
  payment_id: string;
}

export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<CheckoutSession> {
  const baseUrl = getDodoUrl();
  console.log("Dodo checkout:", { baseUrl, testMode: process.env.DODO_TEST_MODE, productId: options.productId });

  const response = await fetch(`${baseUrl}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_link: true,
      billing: {
        city: "N/A",
        country: "US",
        state: "N/A",
        street: "N/A",
        zipcode: 0,
      },
      customer: {
        email: options.userEmail,
        name: options.userEmail,
      },
      product_cart: [
        {
          product_id: options.productId,
          quantity: 1,
        },
      ],
      return_url: options.successUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Dodo API error:", response.status, errorText);
    throw new Error(`Dodo checkout failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    checkout_url: data.payment_link || data.checkout_url || data.url,
    payment_id: data.payment_id || data.id,
  };
}

export async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `${getDodoUrl()}/subscriptions/${subscriptionId}`,
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
    `${getDodoUrl()}/subscriptions/${subscriptionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to cancel subscription");
  }

  return response.json();
}
