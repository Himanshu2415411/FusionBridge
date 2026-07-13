/**
 * API Response Class
 * Standardized response format for all API endpoints
 */

class ApiResponse {
  constructor(statusCode, data, message = "Success", errors = undefined) {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.errors = errors
  }

  toJSON() {
    return {
      success: this.statusCode < 400,
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
    }
  }
}

/**
 * API Response with Pagination
 */
class ApiResponseWithPagination {
  constructor(statusCode, data, pagination, message = "Success") {
    this.statusCode = statusCode
    this.data = data
    this.pagination = pagination
    this.message = message
  }

  toJSON() {
    return {
      success: this.statusCode < 400,
      statusCode: this.statusCode,
      data: this.data,
      pagination: this.pagination,
      message: this.message,
    }
  }
}

/**
 * Send Success Response
 */
const sendSuccess = (res, statusCode = 200, data = null, message = "Success") => {
  res.status(statusCode).json(new ApiResponse(statusCode, data, message).toJSON())
}

/**
 * Send Paginated Response
 */
const sendPaginated = (
  res,
  data,
  pagination,
  message = "Success"
) => {
  const pages = Math.ceil(pagination.total / pagination.limit)
  res.status(200).json(
    new ApiResponseWithPagination(
      200,
      data,
      {
        ...pagination,
        pages,
      },
      message
    ).toJSON()
  )
}

/**
 * Send Error Response
 */
const sendError = (
  res,
  statusCode = 500,
  message = "Server Error",
  errors = undefined
) => {
  res.status(statusCode).json(
    new ApiResponse(statusCode, null, message, errors).toJSON()
  )
}

/**
 * Send Validation Error
 */
const sendValidationError = (res, errors) => {
  res.status(400).json(
    new ApiResponse(400, null, "Validation Failed", errors).toJSON()
  )
}

module.exports = {
  ApiResponse,
  ApiResponseWithPagination,
  sendSuccess,
  sendPaginated,
  sendError,
  sendValidationError,
}
