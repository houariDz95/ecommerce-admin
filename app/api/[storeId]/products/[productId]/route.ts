import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismaDb from "@/lib/prismaDb";


export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismaDb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        sizes: true,
        colors: true,
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const storeByUserId = await prismaDb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismaDb.product.delete({
      where: {
        id: params.productId
      },
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const body = await req.json();
    const { name, price, categoryId, colors, sizes, images, isFeatured, isArchived } = body;

    // Verify if the user has access to the store
    const storeByUserId = await prismaDb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Update the product
    const updatedProduct = await prismaDb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        images: {
          deleteMany: {}, // Delete existing images
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
        colors: {
          set: await getValidColorIds(colors), // Validate and update color IDs
        },
        sizes: {
          set: await getValidSizeIds(sizes), // Validate and update size IDs
        },
      },
      include: {
        colors: true,
        sizes: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log('[PRODUCTS_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Function to validate and retrieve valid color IDs
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
