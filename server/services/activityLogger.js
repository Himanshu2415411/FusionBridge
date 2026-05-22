/**
 * Activity Logger - Logs user activities and events
 */

const Activity = require('../models/Activity')

const ACTIVITY_TYPES = {
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  COURSE_STARTED: 'course_started',
  COURSE_COMPLETED: 'course_completed',
  QUIZ_ATTEMPTED: 'quiz_attempted',
  QUIZ_PASSED: 'quiz_passed',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  STREAK_MILESTONE: 'streak_milestone',
  CERTIFICATE_EARNED: 'certificate_earned',
}

/**
 * Log an activity
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {object} options - Additional options
 * @returns {Promise<object>} Created activity
 */
const logActivity = async (userId, activityType, options = {}) => {
  try {
    const {
      courseId,
      courseName,
      lessonId,
      lessonName,
      quizScore,
      badgeName,
      newLevel,
      streakCount,
      certificateId,
    } = options

    let message = ''
    const metadata = {}

    switch (activityType) {
      case ACTIVITY_TYPES.LESSON_STARTED:
        message = `Started lesson "${lessonName}"`
        metadata.courseId = courseId
        metadata.courseName = courseName
        metadata.lessonId = lessonId
        metadata.lessonName = lessonName
        break

      case ACTIVITY_TYPES.LESSON_COMPLETED:
        message = `Completed lesson "${lessonName}"`
        metadata.courseId = courseId
        metadata.courseName = courseName
        metadata.lessonId = lessonId
        metadata.lessonName = lessonName
        break

      case ACTIVITY_TYPES.COURSE_STARTED:
        message = `Started course "${courseName}"`
        metadata.courseId = courseId
        metadata.courseName = courseName
        break

      case ACTIVITY_TYPES.COURSE_COMPLETED:
        message = `Completed course "${courseName}" 🎉`
        metadata.courseId = courseId
        metadata.courseName = courseName
        break

      case ACTIVITY_TYPES.QUIZ_ATTEMPTED:
        message = `Attempted quiz with score ${quizScore}%`
        metadata.courseId = courseId
        metadata.courseName = courseName
        metadata.quizScore = quizScore
        break

      case ACTIVITY_TYPES.QUIZ_PASSED:
        message = `Passed quiz with score ${quizScore}%`
        metadata.courseId = courseId
        metadata.courseName = courseName
        metadata.quizScore = quizScore
        break

      case ACTIVITY_TYPES.BADGE_EARNED:
        message = `Earned badge: ${badgeName} ${options.icon || '🏆'}`
        metadata.badgeName = badgeName
        metadata.badgeId = options.badgeId
        break

      case ACTIVITY_TYPES.LEVEL_UP:
        message = `Leveled up to Level ${newLevel}! 🚀`
        metadata.newLevel = newLevel
        metadata.totalXp = options.totalXp
        break

      case ACTIVITY_TYPES.STREAK_MILESTONE:
        message = `Reached ${streakCount}-day streak! 🔥`
        metadata.streakCount = streakCount
        break

      case ACTIVITY_TYPES.CERTIFICATE_EARNED:
        message = `Earned certificate for "${courseName}"`
        metadata.courseId = courseId
        metadata.courseName = courseName
        metadata.certificateId = certificateId
        break

      default:
        message = 'Activity logged'
    }

    const activity = new Activity({
      user: userId,
      type: activityType,
      message,
      metadata,
    })

    await activity.save()
    return activity
  } catch (error) {
    console.error('Activity logging error:', error)
    // Don't throw - activity logging should not break the main flow
    return null
  }
}

/**
 * Get user activities
 * @param {string} userId - User ID
 * @param {number} limit - Number of activities to fetch
 * @param {number} skip - Number of activities to skip
 * @returns {Promise<array>} Array of activities
 */
const getUserActivities = async (userId, limit = 20, skip = 0) => {
  try {
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    return activities
  } catch (error) {
    console.error('Get user activities error:', error)
    return []
  }
}

/**
 * Get activity feed for dashboard
 * @param {string} userId - User ID
 * @returns {Promise<array>} Last 10 activities
 */
const getActivityFeed = async (userId) => {
  return getUserActivities(userId, 10, 0)
}

/**
 * Get activities by type
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity to filter
 * @param {number} limit - Number to fetch
 * @returns {Promise<array>} Array of activities
 */
const getActivitiesByType = async (userId, activityType, limit = 10) => {
  try {
    const activities = await Activity.find({
      user: userId,
      type: activityType,
    })
      .sort({ createdAt: -1 })
      .limit(limit)

    return activities
  } catch (error) {
    console.error('Get activities by type error:', error)
    return []
  }
}

/**
 * Get activity statistics
 * @param {string} userId - User ID
 * @returns {Promise<object>} Activity stats
 */
const getActivityStats = async (userId) => {
  try {
    const stats = {}

    // Count activities by type
    for (const [key, type] of Object.entries(ACTIVITY_TYPES)) {
      const count = await Activity.countDocuments({
        user: userId,
        type: type,
      })
      stats[key] = count
    }

    return stats
  } catch (error) {
    console.error('Get activity stats error:', error)
    return {}
  }
}

/**
 * Delete old activities (cleanup)
 * @param {Date} beforeDate - Delete activities before this date
 * @returns {Promise<number>} Number of deleted activities
 */
const deleteOldActivities = async (beforeDate) => {
  try {
    const result = await Activity.deleteMany({
      createdAt: { $lt: beforeDate },
    })
    return result.deletedCount
  } catch (error) {
    console.error('Delete old activities error:', error)
    return 0
  }
}

module.exports = {
  ACTIVITY_TYPES,
  logActivity,
  getUserActivities,
  getActivityFeed,
  getActivitiesByType,
  getActivityStats,
  deleteOldActivities,
}
