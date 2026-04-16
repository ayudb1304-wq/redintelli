import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/dodo/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to upgrade" } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { productId } = body;

  const validProducts = [
    process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER,
    process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO,
  ];

  if (!validProducts.includes(productId)) {
    return NextResponse.json(
      { error: { code: "invalid_product", message: "Invalid product" } },
      { status: 400 }
    );
  }

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      productId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error: {
          code: "checkout_failed",
          message: "Failed to create checkout session",
        },
      },
      { status: 500 }
    );
  }
}
