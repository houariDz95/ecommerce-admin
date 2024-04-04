import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismaDb';

interface OrderItemProps {
    productId: string;
    choosenColor: string;
    choosenSize: string;
    quantity: number;
  }
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try { 
    const body = await req.json();
    const { address, phone, city, deliveryPrice, orderItems } = body;

    // Create the order
    const order = await prismaDb.order.create({
      data: {
        storeId: params.storeId,
        phone: phone,
        address: address,
        city: city,
        deliveryPrice: deliveryPrice,
        orderItems: {
          create: orderItems.map((item: OrderItemProps) => ({
            productId: item.productId,
            color: item.choosenColor,
            size: item.choosenSize,
            quantity: item.quantity
          }))
        }
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
