import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

type RouteParams = {
  params: Promise<{ storeId: string }>;
};

export async function POST(req: Request, { params }: RouteParams) {
  try {
    // Await the params to get storeId
    const { storeId } = await params;
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return new NextResponse("Items are required", { status: 400 });
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const variationIds = items
      .map((item: { variationId: string }) => item.variationId)
      .filter(Boolean);

    const products = await prismadb.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        variations: {
          where: {
            id: { in: variationIds },
          },
          include: {
            size: true,
            color: true,
          },
        },
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = products.find((p: typeof products[number]) => p.id === item.productId);
      const variation = product?.variations.find(
        (v: typeof product.variations[number]) => v.id === item.variationId
      ) || product?.variations[0];

      if (!product || !variation) {
        return new NextResponse(`Invalid product or variation: ${item.productId}`, { status: 400 });
      }

      line_items.push({
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: `${product.name} (${variation.size?.name || "No Size"} / ${variation.color?.name || "No Color"})`,
          },
          unit_amount: Math.round(variation.price * 100), // Convert to cents
        },
      });
    }

    const order = await prismadb.order.create({
      data: {
        storeId: storeId,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        address: "",
        phone: "",
        orderItems: {
          create: items.map((item: { productId: string; variationId: string }) => ({
            product: { connect: { id: item.productId } },
            variation: item.variationId ? { connect: { id: item.variationId } } : undefined,
          })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error("[CHECKOUT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
