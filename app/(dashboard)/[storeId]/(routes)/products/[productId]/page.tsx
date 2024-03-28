

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
      sizes: true,
      colors: true,
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
    colors: product?.colors.map(color => ({ label: color.name, value: color.id })),
    sizes: product?.sizes.map(size => ({ label: size.name, value: size.id }))
  } : null

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
