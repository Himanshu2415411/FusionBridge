/**
 * Error Handler Utility
 * Centralized error handling for the application
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public context: string = ""
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const getErrorMessage = (error: unknown, context = ""): string => {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as any).message)
  }

  return "An unexpected error occurred"
}

export const handleApiError = (
  error: unknown,
  context = ""
): { status: number; message: string } => {
  if (error instanceof Response) {
    const status = error.status

    if (status === 401) {
      return { status, message: "Please log in again" }
    }
    if (status === 403) {
      return { status, message: "You do not have permission" }
    }
    if (status === 404) {
      return { status, message: "Resource not found" }
    }
    if (status === 429) {
      return { status, message: "Too many requests. Please try again later" }
    }
    if (status >= 500) {
      return { status, message: "Server error. Please try again later" }
    }
  }

  const message = getErrorMessage(error, context)
  return { status: 500, message }
}

export const logError = (error: unknown, context = ""): void => {
  const message = getErrorMessage(error, context)
  console.error(`[${context}] ${message}`, error)
}
