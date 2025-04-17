
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/components/ui/use-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Error handling utility
export function handleError(error: unknown, customMessage?: string): string {
  console.error(error);
  
  // Extract error message based on error type
  let errorMessage = customMessage || "An unexpected error occurred";
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    errorMessage = error.message;
  }
  
  // Show toast notification for the error
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  
  return errorMessage;
}

// Format currency with proper decimal places and currency sign
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Get date ranges for common time periods
export function getDateRange(period: "today" | "week" | "month" | "year"): { startDate: string, endDate: string } {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now);
  }
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  };
}
