"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ProductColumn = {
  id: string
  name: string;
  price: string;
  category: string;
  sizes: string[];
  colors: string[];
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "sizes",
    header: "Sizes",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.sizes.length > 0 ? (
          row.original.sizes.map((size, index) => (
           <span key={index}>{size}</span>
          ))
        ) : (
          <span>No color available</span>
        )}
      </div>
    )
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.colors.length > 0 ? (
          row.original.colors.map((color, index) => (
            <div
              key={index}
              className="h-6 w-6 rounded-full border"
              style={{ backgroundColor: color }}
            />
          ))
        ) : (
          <span>No color available</span>
        )}
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
