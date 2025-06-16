import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { Category, Billboard } from "@prisma/client";

import { CategoryColumn } from "./components/columns";
import { CategoriesClient } from "./components/client";

type CategoryWithBillboard = Category & {
  billboard: Billboard;
};

// Define the type for params explicitly
type CategoriesPageProps = {
  params: Promise<{ storeId: string }>;
};

const CategoriesPage = async ({ params }: CategoriesPageProps) => {
  // Await the params to get storeId
  const { storeId } = await params;

  const categories = (await prismadb.category.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      billboard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as CategoryWithBillboard[];

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoriesClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
