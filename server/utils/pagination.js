/**
 * Extract and calculate pagination parameters from request query
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination parameters: { page, limit, skip }
 */
const getPaginationParams = (query) => {
  // Parse page and limit from query, with defaults
  let page = parseInt(query.page) || 1
  let limit = parseInt(query.limit) || 10

  // Ensure page is at least 1
  if (page < 1) {
    page = 1
  }

  // Ensure limit is at least 1 and max 50
  if (limit < 1) {
    limit = 1
  }
  if (limit > 50) {
    limit = 50
  }

  // Calculate skip
  const skip = (page - 1) * limit

  return {
    page,
    limit,
    skip,
  }
}

module.exports = {
  getPaginationParams,
}
