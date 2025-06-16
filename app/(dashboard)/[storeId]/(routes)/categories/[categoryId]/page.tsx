import prismadb from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";

// Define the type for params explicitly
type CategoryPageProps = {
  params: Promise<{ categoryId: string; storeId: string }>;
};

const CategoryPage = async ({ params }: CategoryPageProps) => {
  // Await the params to get categoryId and storeId
  const { categoryId, storeId } = await params;

  const category =
    categoryId === "new"
      ? null
      : await prismadb.category.findUnique({
          where: {
            id: categoryId,
          },
        });

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  );
};

export default CategoryPage;
