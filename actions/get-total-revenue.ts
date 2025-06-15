import prismadb from "@/lib/prismadb";
import { Order, OrderItem, Product, Variation } from "@prisma/client";

// Define the type for the order with included relations
type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product;
    variation: Variation | null;
  })[];
};

export const getTotalRevenue = async (storeId: string): Promise<number> => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          variation: true,
        },
      },
    },
  }) as OrderWithItems[];

  const totalRevenue = paidOrders.reduce((total: number, order: OrderWithItems) => {
    const orderTotal = order.orderItems.reduce((orderSum: number, item: OrderWithItems["orderItems"][number]) => {
      // Use variation price if available, otherwise fall back to product price
      const price = item.variation?.price ?? item.product.price ?? 0;

      if (price === 0) {
        console.warn(`No price found for order item ${item.id} (variationId: ${item.variationId}, productId: ${item.productId})`);
      }

      return orderSum + price;
    }, 0);

    return total + orderTotal;
  }, 0);

  return totalRevenue;
};