import prismadb from "@/lib/prismadb";
import { SizeForm } from "./components/size-form";

// Define the type for params explicitly
type SizePageProps = {
  params: Promise<{ sizeId: string; storeId: string }>;
};

const SizePage = async ({ params }: SizePageProps) => {
  // Await the params to get sizeId
  const { sizeId } = await params;

  const size =
    sizeId === "new"
      ? null
      : await prismadb.size.findUnique({
          where: {
            id: sizeId,
          },
        });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeForm initialData={size} />
      </div>
    </div>
  );
};

export default SizePage;
