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
