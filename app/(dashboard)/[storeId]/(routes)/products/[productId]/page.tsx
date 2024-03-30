

import prismaDb from "@/lib/prismaDb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params
}: {
  params: { productId: string, storeId: string }
}) => {
  const product = await prismaDb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      productColors: true,
      productSizes: true,
    },
  });


  const categories = await prismaDb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const sizes = await prismaDb.size.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const colors = await prismaDb.color.findMany({
    where: {
      storeId: params.storeId,
    }, 
  });

  const initialData = product ? {
    ...product,
    colors: await Promise.all(product.productColors.map(async color => {
      const colorData = await prismaDb.color.findUnique({ where: { id: color.colorId } });
      return { label: colorData?.name ?? 'Unknown', value: color.colorId };
    })),
    sizes: await Promise.all(product.productSizes.map(async size => {
      const sizeData = await prismaDb.size.findUnique({ where: { id: size.sizeId } });
      return { label: sizeData?.name ?? 'Unknown', value: size.sizeId };
    }))
  } : null;
  

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
          categories={categories} 
          colors={colors}
          sizes={sizes}
          initialData={initialData}
        />
      </div>
    </div>
  );
}

export default ProductPage;
