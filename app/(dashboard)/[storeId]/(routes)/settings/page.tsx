import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

import { SettingsForm } from "./components/settings-form";

// Define the type for params explicitly
type SettingsPageProps = {
  params: Promise<{ storeId: string }>;
};

const SettingsPage = async ({ params }: SettingsPageProps) => {
  // Await the params to get storeId
  const { storeId } = await params;

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
};

export default SettingsPage;
