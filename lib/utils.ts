import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Convert prisma object into a regular js object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function formatError(error: any) {
//   if (error.name === "ZodError") {
//     // Handle Zod errors
//     const fieldErrors = error.issues.map(
//       (issue: { message: string }) => issue.message
//     );

//     return fieldErrors.join(". ");
//   } else if (
//     error.name === "PrismaClientKnownRequestError" &&
//     error.code === "P2002"
//   ) {
//     // Handle Prisma error
//     const field = error.meta?.target ? error.meta.target[0] : "Field";

//     return `${field.charAt(0).toUpperCase() + field.slice(1)} doit être unique.`;
//   } else {
//     // Handle other errors
//     return error.message === "string"
//       ? error.message
//       : JSON.stringify(error.message) || "Une erreur est survenue.";
//   }
// }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  const messages: string[] = [];

  // Zod errors
  if (error.name === "ZodError" && Array.isArray(error.issues)) {
    messages.push(
      ...error.issues.map((issue: { message: string }) => issue.message)
    );
  }

  // Prisma P2002 error
  if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    messages.push(
      `${field.charAt(0).toUpperCase() + field.slice(1)} doit être unique.`
    );
  }

  // Other errors
  if (error.message && !messages.length) {
    if (typeof error.message === "string") {
      messages.push(error.message);
    } else {
      messages.push(JSON.stringify(error.message));
    }
  }

  // Fallback si aucun message
  if (!messages.length) {
    messages.push("Une erreur est survenue.");
  }

  return messages.join(". ");
}
