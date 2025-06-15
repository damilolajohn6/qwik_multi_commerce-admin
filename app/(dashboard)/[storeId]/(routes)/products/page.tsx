import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  const products = await prismadb.product.findMany({
    where: { storeId: params.storeId },
    include: {
      category: true,
      variations: { include: { size: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    price: formatter.format(
      item.variations.length > 0 ? Number(item.variations[0].price) : 0
    ),
    category: item.category.name,
    variations: item.variations
      .map((v) => `${v.size?.name || "No Size"}/${v.color?.name || "No Color"}`)
      .join(", "),
    size: item.variations.length > 0 && item.variations[0].size ? item.variations[0].size.name : "No Size",
    color: item.variations.length > 0 && item.variations[0].color ? item.variations[0].color.name : "No Color",
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
