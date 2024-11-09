import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismaDb from '@/lib/prismaDb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const body = await req.json();
    const { name, price, categoryId, images, isFeatured, isArchived, colors, sizes } = body;

    // Extract IDs only if colors and sizes are provided
    const colorIds = colors ? colors.map((color: { value: string }) => color.value) : [];
    const sizeIds = sizes ? sizes.map((size: { value: string }) => size.value) : [];

    // Create the product
    const product = await prismaDb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        storeId: params.storeId,
        // Connect the images to the product
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
        // Only create product-color associations if colors are provided
        productColors: colorIds.length > 0
          ? {
              createMany: {
                data: colorIds.map((colorId: string) => ({ colorId })),
              },
            }
          : undefined,
        // Only create product-size associations if sizes are provided
        productSizes: sizeIds.length > 0
          ? {
              createMany: {
                data: sizeIds.map((sizeId: string) => ({ sizeId })),
              },
            }
          : undefined,
      },
      // Include the associated colors and sizes in the response
      include: {
        productColors: true,
        productSizes: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismaDb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        productColors: {
          include: {
            color: true
          }
        },
        productSizes: {
          include: {
            size: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  
    return NextResponse.json(products);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};