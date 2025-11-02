import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUserAdmin(userEmail: string | undefined): boolean {
  if (!userEmail) return false;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim());
  return adminEmails.includes(userEmail);
}
