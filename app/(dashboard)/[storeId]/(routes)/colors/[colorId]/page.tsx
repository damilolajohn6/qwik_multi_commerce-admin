import prismadb from "@/lib/prismadb";
import { ColorForm } from "./components/color-form";

// Define the type for params explicitly
type ColorPageProps = {
  params: Promise<{ colorId: string; storeId: string }>;
};

const ColorPage = async ({ params }: ColorPageProps) => {
  // Await the params to get colorId and storeId
  const { colorId } = await params;

  const color =
    colorId === "new"
      ? null
      : await prismadb.color.findUnique({
          where: {
            id: colorId,
          },
        });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initialData={color} />
      </div>
    </div>
  );
};

export default ColorPage;
