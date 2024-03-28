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
    const { name, price, categoryId, colors, sizes, images, isFeatured, isArchived } = body;

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
        // Connect colors and sizes to the product
        colors: {
          connect: await getValidColorIds(colors), // Validate color IDs
        },
        sizes: {
          connect: await getValidSizeIds(sizes), // Validate size IDs
        },
      },
      // Include the colors and sizes in the response
      include: {
        colors: true,
        sizes: true,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function getValidColorIds(colors: { value: string }[]) {
  const validColorIds = await prismaDb.color.findMany({
    where: {
      id: {
        in: colors.map((color) => color.value),
      },
    },
    select: {
      id: true,
    },
  });
  return validColorIds.map((color) => ({ id: color.id }));
}

// Function to validate and retrieve valid size IDs
async function getValidSizeIds(sizes: { value: string }[]) {
  const validSizeIds = await prismaDb.size.findMany({
    where: {
      id: {
        in: sizes.map((size) => size.value),
      },
    },
    select: {
      id: true,
    },
  });
  return validSizeIds.map((size) => ({ id: size.id }));
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined;
    const colorIds = searchParams.getAll('colorId') || [];
    const sizeIds = searchParams.getAll('sizeId') || [];
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
        colors: true,
        sizes: true,
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