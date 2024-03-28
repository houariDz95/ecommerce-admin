import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'DZD',
  minimumFractionDigits: 0, // Set the minimumFractionDigits to 0
  maximumFractionDigits: 2, // Keep the maximumFractionDigits to 2 for other cases
});