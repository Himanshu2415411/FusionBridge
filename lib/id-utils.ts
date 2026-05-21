/**
 * ID Utility Functions
 * Handles inconsistent _id/id naming across the application
 */

/**
 * Extract ID from any object (handles both _id and id)
 * @param item - Object with _id or id property
 * @returns The ID or undefined
 */
export const getId = (item: any): string | undefined => {
  if (!item) return undefined
  return item._id || item.id
}

/**
 * Extract course ID
 * @param course - Course object
 * @returns Course ID or undefined
 */
export const getCourseId = (course: any): string | undefined => {
  return getId(course)
}

/**
 * Extract lesson ID
 * @param lesson - Lesson object
 * @returns Lesson ID or undefined
 */
export const getLessonId = (lesson: any): string | undefined => {
  return getId(lesson)
}

/**
 * Extract user ID
 * @param user - User object
 * @returns User ID or undefined
 */
export const getUserId = (user: any): string | undefined => {
  return getId(user)
}

/**
 * Ensure all items in array have consistent _id field
 * @param items - Array of items
 * @returns Array with items normalized to have _id
 */
export const normalizeIds = (items: any[]): any[] => {
  if (!Array.isArray(items)) return []
  
  return items.map(item => ({
    ...item,
    _id: item._id || item.id
  }))
}

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param id - ID to validate
 * @returns Boolean indicating validity
 */
export const isValidId = (id: any): boolean => {
  if (typeof id !== "string") return false
  return /^[0-9a-fA-F]{24}$/.test(id)
}
