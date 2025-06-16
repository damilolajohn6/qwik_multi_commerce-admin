import { format } from "date-fns";
import prismadb from "@/lib/prismadb";

import { ColorColumn } from "./components/columns";
import { ColorClient } from "./components/client";

// Define the type for params explicitly
type ColorsPageProps = {
  params: Promise<{ storeId: string }>;
};

const ColorsPage = async ({ params }: ColorsPageProps) => {
  // Await the params to get storeId
  const { storeId } = await params;

  const colors = await prismadb.color.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedColors: ColorColumn[] = colors.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorClient data={formattedColors} />
      </div>
    </div>
  );
};

export default ColorsPage;
