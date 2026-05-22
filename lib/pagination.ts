/**
 * Pagination utility for backend
 * Handles pagination calculations and cursor tracking
 */

export function calculatePagination(page = 1, limit = 12, total = 0) {
  const validPage = Math.max(1, page)
  const validLimit = Math.max(1, Math.min(limit, 100)) // Max 100 per page
  
  const skip = (validPage - 1) * validLimit
  const totalPages = Math.ceil(total / validLimit)
  const hasMore = validPage < totalPages
  const hasPrevious = validPage > 1

  return {
    page: validPage,
    limit: validLimit,
    skip,
    total,
    totalPages,
    hasMore,
    hasPrevious,
  }
}

/**
 * Format pagination response
 */
export function formatPaginatedResponse(data, pagination) {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasMore: pagination.hasMore,
      hasPrevious: pagination.hasPrevious,
    },
  }
}

/**
 * Cursor-based pagination for better performance with large datasets
 */
export function calculateCursorPagination(cursor = null, limit = 12, items = []) {
  const validLimit = Math.max(1, Math.min(limit, 100))
  
  let startIndex = 0
  if (cursor) {
    startIndex = items.findIndex((item) => item._id.toString() === cursor) + 1
  }

  const pageItems = items.slice(startIndex, startIndex + validLimit)
  const nextCursor = pageItems.length === validLimit ? pageItems[pageItems.length - 1]?._id : null
  const previousCursor = cursor || null

  return {
    items: pageItems,
    nextCursor,
    previousCursor,
    hasMore: pageItems.length === validLimit,
  }
}

/**
 * Create pagination query params
 */
export function getPaginationParams(searchParams) {
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || '-createdAt'

  return {
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), 100),
    search: search.trim(),
    sort,
  }
}
