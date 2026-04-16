import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dodo from "@/lib/dodo/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productId } = body as { productId: string };

  const validProducts = [
    process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER,
    process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO,
  ];

  if (!validProducts.includes(productId)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!,
      },
      metadata: { user_id: user.id },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
