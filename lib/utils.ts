import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYearOptions(startYear: number = 2018): number[] {
  const currentYear = new Date().getFullYear();
  const years = [];
  // Generate years from current year + 1 down to startYear
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push(year);
  }
  return years;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateForInput(dateString?: string | null): string {
  if (!dateString) return '';
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}
