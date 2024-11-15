import { format } from "date-fns";

import { formatter } from "@/lib/utils";

import { OrderColumn } from "./components/columns"
import { OrderClient } from "./components/client";
import prismaDb from "@/lib/prismaDb";



const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const orders = await prismaDb.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: "0" + item.phone,
    address: item.address,
    products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
    quantity: item.orderItems.map((orderItem) => orderItem.quantity).join(', '),
    choosenColor: item.orderItems.map((orderItem) => orderItem.color).join(', '),
    choosenSize: item.orderItems.map((orderItem) => orderItem.size).join(', '),
    deliveryPrice: item.deliveryPrice,
    city: item.city,
    totalPrice: formatter.format(item.orderItems.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity
    }, 0)),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  console.log(orders)
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
