import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

// Define the type for params explicitly
type RouteParams = {
  params: Promise<{ storeId: string }>;
};

export async function POST(req: Request, { params }: RouteParams) {
  try {
    // Await the params to get storeId
    const { storeId } = await params;
    const { userId } = await auth();
    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const now = new Date();
    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: storeId,
        createdAt: now,
        updatedAt: now,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.error("[SIZES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    // Await the params to get storeId
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: storeId,
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.error("[SIZES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
