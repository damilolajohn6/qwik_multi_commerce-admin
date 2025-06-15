import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (error) {
    console.error("Error fetching auth:", error);
    redirect("/sign-in");
  }

  if (!userId) {
    redirect("/sign-in");
  }

  const resolvedParams = await params;
  const store = await prismadb.store.findFirst({
    where: {
      id: resolvedParams.storeId,
      userId,
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
