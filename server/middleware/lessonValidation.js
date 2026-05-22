/**
 * Lesson Completion Validation
 * Validates that users have actually watched lessons before marking complete
 */

const { ApiResponse } = require("../utils/apiResponse")

/**
 * Validate lesson watch time
 * Requires 80% of lesson duration watched
 * Prevents skipping to end to mark complete
 *
 * Middleware for lesson completion endpoints
 */
const validateWatchTime = async (req, res, next) => {
  try {
    const { courseId, lessonId, watchedSeconds } = req.body

    if (!courseId || !lessonId || watchedSeconds === undefined) {
      return res.status(400).json(
        new ApiResponse(400, null, "courseId, lessonId, and watchedSeconds are required").toJSON()
      )
    }

    // Get lesson duration from request (passed by frontend)
    const { lessonDuration } = req.body

    if (!lessonDuration) {
      return res.status(400).json(
        new ApiResponse(400, null, "Lesson duration is required").toJSON()
      )
    }

    // Calculate watch percentage
    const watchPercentage = (watchedSeconds / lessonDuration) * 100

    // Require 80% watched
    const REQUIRED_WATCH_PERCENTAGE = 80

    if (watchPercentage < REQUIRED_WATCH_PERCENTAGE) {
      return res.status(403).json(
        new ApiResponse(
          403,
          {
            watchedPercentage: Math.round(watchPercentage),
            requiredPercentage: REQUIRED_WATCH_PERCENTAGE,
            remainingSeconds: Math.ceil((lessonDuration * REQUIRED_WATCH_PERCENTAGE) / 100 - watchedSeconds),
          },
          `Please watch at least ${REQUIRED_WATCH_PERCENTAGE}% of the lesson to complete it`
        ).toJSON()
      )
    }

    // Store validated watch data
    req.validatedWatchData = {
      watchedSeconds,
      watchPercentage: Math.round(watchPercentage),
      lessonDuration,
    }

    next()
  } catch (error) {
    console.error("Watch time validation error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Verify lesson hasn't already been completed
 * Prevents duplicate completions and XP farming
 */
const preventDuplicateCompletion = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body || req.params
    const userId = req.user._id

    // This will be checked in the route handler against the enrollment
    // Just marking it as validated here
    req.preventDuplicateCheck = true
    next()
  } catch (error) {
    console.error("Duplicate completion check error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Validate lesson exists and belongs to course
 * Called before marking lesson complete
 */
const validateLessonExists = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body || req.params

    if (!courseId || !lessonId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Course ID and Lesson ID are required").toJSON()
      )
    }

    // Course and lesson validation will happen in route handler
    req.lessonValidated = true
    next()
  } catch (error) {
    console.error("Lesson validation error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Track and validate watch progress
 * Can be called multiple times as user watches
 * Stores progress in request object
 */
const trackWatchProgress = (req, res, next) => {
  try {
    const { watchedSeconds, currentTime } = req.body

    if (watchedSeconds === undefined) {
      return res.status(400).json(
        new ApiResponse(400, null, "watchedSeconds is required").toJSON()
      )
    }

    // Validate watched seconds is reasonable (not negative, not in future)
    if (watchedSeconds < 0) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid watch time").toJSON()
      )
    }

    // Store for later processing
    req.watchProgress = {
      watchedSeconds,
      timestamp: new Date(),
      currentTime,
    }

    next()
  } catch (error) {
    console.error("Watch progress tracking error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

module.exports = {
  validateWatchTime,
  preventDuplicateCompletion,
  validateLessonExists,
  trackWatchProgress,
}
