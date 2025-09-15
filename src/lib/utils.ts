import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyText = async (linkToOpen: string) => {
  await navigator.clipboard.writeText(linkToOpen);
};

export const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:9002" : "https://formset.vercel.app";