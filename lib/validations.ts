/**
 * Validation Schemas using Zod
 * Used for both frontend form validation and backend API validation
 */

import { z } from "zod"

// ============ AUTH VALIDATION ============

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// ============ COURSE VALIDATION ============

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category cannot exceed 50 characters"),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  price: z.number().nonnegative("Price cannot be negative").optional(),
})

export const createCourseSchema = courseSchema

export const updateCourseSchema = courseSchema.partial()

// ============ LESSON VALIDATION ============

export const lessonSchema = z.object({
  title: z
    .string()
    .min(3, "Lesson title must be at least 3 characters")
    .max(200, "Lesson title cannot exceed 200 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  videoUrl: z.string().url("Please provide a valid video URL"),
  duration: z
    .number()
    .positive("Duration must be positive")
    .finite("Duration must be a valid number"),
  order: z.number().nonnegative().optional(),
})

export const addLessonSchema = lessonSchema

// ============ PROGRESS VALIDATION ============

export const progressSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
  watchedSeconds: z.number().nonnegative().optional(),
})

export const quizSubmissionSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
  answers: z.record(z.number()),
  score: z.number().min(0).max(100),
})

// ============ TYPE EXPORTS ============

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type LessonInput = z.infer<typeof lessonSchema>
export type AddLessonInput = z.infer<typeof addLessonSchema>
export type ProgressInput = z.infer<typeof progressSchema>
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>

/**
 * Helper function to validate and transform data
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws error
 */
export function validate<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    throw new Error(JSON.stringify(errors))
  }
  
  return result.data
}

/**
 * Helper function for safe validation
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success boolean and errors
 */
export function safeValidate<T>(
  schema: z.Schema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string[]> } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }
  
  return {
    success: true,
    data: result.data,
  }
}
