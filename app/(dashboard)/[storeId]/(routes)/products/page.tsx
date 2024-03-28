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
      sizes: true,
      colors: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    price: formatter.format(Number(item.price)),
    category: item.category.name,
    sizes: item.sizes.map(size => size.name), // Assuming sizes is an array of size objects
    colors: item.colors.map(color => color.value),
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
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
