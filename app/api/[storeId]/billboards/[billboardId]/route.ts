import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

// Define the type for params explicitly
type GetParams = {
  params: Promise<{ billboardId: string }>;
};

type ModifyParams = {
  params: Promise<{ billboardId: string; storeId: string }>;
};

export async function GET(req: Request, { params }: GetParams) {
  try {
    // Await the params to get billboardId
    const { billboardId } = await params;

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: ModifyParams) {
  try {
    // Await the params to get billboardId and storeId
    const { billboardId, storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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

    const billboard = await prismadb.billboard.delete({
      where: {
        id: billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: ModifyParams) {
  try {
    // Await the params to get billboardId and storeId
    const { billboardId, storeId } = await params;
    const { userId } = await auth();
    const body = await req.json();

    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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

    const billboard = await prismadb.billboard.update({
      where: {
        id: billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
