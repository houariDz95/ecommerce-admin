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
        productColors: {include: {color: true}},
        productSizes: {include: {size: true}},
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
    const { name, price, categoryId, images, isFeatured, isArchived, colors, sizes } = body;

    // Verify user's access to the store
    const storeByUserId = await prismaDb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Extract the IDs from the colors and sizes arrays
    const colorIds = colors.map((color: { value: string }) => color.value);
    const sizeIds = sizes.map((size: { value: string }) => size.value);

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
        // Connect the images to the product
        images: {
          deleteMany: {}, // Delete existing images
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
        // Update product-color associations
        productColors: {
          deleteMany: {}, // Delete existing color associations
          createMany: {
            data: colorIds.map((colorId: string) => ({ colorId })),
          },
        },
        // Update product-size associations
        productSizes: {
          deleteMany: {}, // Delete existing size associations
          createMany: {
            data: sizeIds.map((sizeId: string) => ({ sizeId })),
          },
        },
      },
      // Include the associated colors and sizes in the response
      include: {
        productColors: true,
        productSizes: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log('[PRODUCTS_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
