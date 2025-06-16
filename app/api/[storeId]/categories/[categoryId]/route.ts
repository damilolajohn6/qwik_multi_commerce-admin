import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

// Define the type for params explicitly
type GetParams = {
  params: Promise<{ categoryId: string }>;
};

type ModifyParams = {
  params: Promise<{ categoryId: string; storeId: string }>;
};

export async function GET(req: Request, { params }: GetParams) {
  try {
    // Await the params to get categoryId
    const { categoryId } = await params;

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        billboard: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: ModifyParams) {
  try {
    // Await the params to get categoryId and storeId
    const { categoryId, storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
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

    const category = await prismadb.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: ModifyParams) {
  try {
    // Await the params to get categoryId and storeId
    const { categoryId, storeId } = await params;
    const { userId } = await auth();
    const body = await req.json();

    const { name, billboardId } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
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

    const category = await prismadb.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        billboardId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
