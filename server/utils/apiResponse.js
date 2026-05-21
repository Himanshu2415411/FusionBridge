/**
 * API Response Class
 * Standardized response format for all API endpoints
 */

class ApiResponse {
  constructor(
    public statusCode: number,
    public data: any,
    public message: string = "Success",
    public errors?: Record<string, any>
  ) {}

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
  constructor(
    public statusCode: number,
    public data: any[],
    public pagination: {
      page: number
      limit: number
      total: number
      pages: number
    },
    public message: string = "Success"
  ) {}

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
const sendSuccess = (res: any, statusCode = 200, data: any = null, message = "Success") => {
  res.status(statusCode).json(new ApiResponse(statusCode, data, message).toJSON())
}

/**
 * Send Paginated Response
 */
const sendPaginated = (
  res: any,
  data: any[],
  pagination: { page: number; limit: number; total: number },
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
  res: any,
  statusCode = 500,
  message = "Server Error",
  errors?: Record<string, any>
) => {
  res.status(statusCode).json(
    new ApiResponse(statusCode, null, message, errors).toJSON()
  )
}

/**
 * Send Validation Error
 */
const sendValidationError = (res: any, errors: Record<string, any>) => {
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
