import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const rawProduct =
    params.productId === "new"
      ? null
      : await prismadb.product.findUnique({
          where: { id: params.productId },
          include: {
            images: true,
            variations: { include: { images: true, size: true, color: true } },
          },
        });

  // Map null size/color to undefined for type compatibility
  const product = rawProduct
    ? {
        ...rawProduct,
        variations: rawProduct.variations.map((variation) => ({
          ...variation,
          size: variation.size ?? undefined,
          color: variation.color ?? undefined,
        })),
      }
    : null;

  const categories = await prismadb.category.findMany({
    where: { storeId: params.storeId },
  });

  const sizes = await prismadb.size.findMany({
    where: { storeId: params.storeId },
  });

  const colors = await prismadb.color.findMany({
    where: { storeId: params.storeId },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          colors={colors}
          sizes={sizes}
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;
