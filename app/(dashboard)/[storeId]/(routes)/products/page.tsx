import { format } from "date-fns";

import { formatter } from "@/lib/utils";

import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";
import prismaDb from "@/lib/prismaDb";


const ProductsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const products = await prismaDb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      category: true,
      productColors: true,
      productSizes: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedProducts: ProductColumn[] = await Promise.all(products.map(async (item) => {
    // Fetch names of sizes
    const sizes = await prismaDb.size.findMany({
      where: {
        id: {
          in: item.productSizes.map(size => size.sizeId) // Extract size IDs from productSizes
        }
      },
      select: {
        name: true
      }
    });
  
    // Fetch names of colors
    const colors = await prismaDb.color.findMany({
      where: {
        id: {
          in: item.productColors.map(color => color.colorId) // Extract color IDs from productColors
        }
      },
      select: {
        value: true
      }
    });
  
    return {
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formatter.format(Number(item.price)),
      category: item.category.name,
      sizes: sizes.map(size => size.name),
      colors: colors.map(color => color.value),
      createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    };
  }));
  

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
