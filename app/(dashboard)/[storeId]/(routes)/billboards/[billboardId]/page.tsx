import prismadb from "@/lib/prismadb";
import { BillboardForm } from "./components/billboard-form";

// Define the type for params explicitly
type BillboardPageProps = {
  params: Promise<{ billboardId: string }>;
};

const BillboardPage = async ({ params }: BillboardPageProps) => {
  // Await the params to get the billboardId
  const { billboardId } = await params;

  const billboard =
    billboardId === "new"
      ? null
      : await prismadb.billboard.findUnique({
          where: {
            id: billboardId,
          },
        });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
};

export default BillboardPage;
