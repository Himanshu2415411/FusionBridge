/**
 * Database Transactions
 * Ensures atomic operations and prevents race conditions
 */

const User = require("../models/User")
const Course = require("../models/Course")
const mongoose = require("mongoose")

/**
 * Atomic course enrollment
 * Ensures user and course are both updated atomically
 * Prevents double-charging or inconsistent state
 *
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {object} - { success, enrollment, error }
 */
const atomicEnrollment = async (userId, courseId) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Lock user document
    const user = await User.findByIdAndUpdate(
      userId,
      {},
      { new: true, session }
    )

    if (!user) {
      await session.abortTransaction()
      return {
        success: false,
        error: "User not found",
      }
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === courseId
    )

    if (alreadyEnrolled) {
      await session.abortTransaction()
      return {
        success: false,
        error: "Already enrolled in this course",
      }
    }

    // Lock course document
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $inc: { studentsEnrolled: 1 } },
      { new: true, session }
    )

    if (!course) {
      await session.abortTransaction()
      return {
        success: false,
        error: "Course not found",
      }
    }

    // Add enrollment to user
    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      completedLessons: [],
      lastAccessedLesson: null,
    })

    await user.save({ session })

    // Commit transaction
    await session.commitTransaction()

    return {
      success: true,
      enrollment: user.enrolledCourses[user.enrolledCourses.length - 1],
    }
  } catch (error) {
    await session.abortTransaction()
    console.error("Enrollment transaction error:", error)
    return {
      success: false,
      error: error.message,
    }
  } finally {
    session.endSession()
  }
}

/**
 * Atomic lesson completion
 * Updates both user and course atomically
 * Ensures progress consistency
 *
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {object} - { success, progress, error }
 */
const atomicLessonCompletion = async (userId, courseId, lessonId) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Lock user document
    const user = await User.findByIdAndUpdate(
      userId,
      {},
      { new: true, session }
    )

    if (!user) {
      await session.abortTransaction()
      return {
        success: false,
        error: "User not found",
      }
    }

    // Find enrollment
    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      await session.abortTransaction()
      return {
        success: false,
        error: "Not enrolled in this course",
      }
    }

    // Check if already completed
    if (enrollment.completedLessons.includes(lessonId)) {
      await session.abortTransaction()
      return {
        success: false,
        error: "Lesson already completed",
      }
    }

    // Lock course document
    const course = await Course.findByIdAndUpdate(
      courseId,
      {},
      { new: true, session }
    )

    if (!course) {
      await session.abortTransaction()
      return {
        success: false,
        error: "Course not found",
      }
    }

    // Add completed lesson
    enrollment.completedLessons.push(lessonId)
    enrollment.lastAccessedLesson = lessonId

    await user.save({ session })

    // Commit transaction
    await session.commitTransaction()

    // Calculate progress
    const totalLessons = course.totalLessons || 0
    const completedCount = enrollment.completedLessons.length
    const progressPercent =
      totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100)

    const isCourseComplete = totalLessons > 0 && completedCount === totalLessons

    return {
      success: true,
      progress: {
        completedLessons: completedCount,
        totalLessons,
        progressPercent,
        isCourseComplete,
      },
    }
  } catch (error) {
    await session.abortTransaction()
    console.error("Lesson completion transaction error:", error)
    return {
      success: false,
      error: error.message,
    }
  } finally {
    session.endSession()
  }
}

/**
 * Atomic XP award
 * Awards XP and updates level atomically
 *
 * @param {string} userId - User ID
 * @param {number} xpAmount - XP to award
 * @param {string} action - Action type (lesson, quiz, course, etc)
 * @returns {object} - { success, newXp, newLevel, error }
 */
const atomicXpAward = async (userId, xpAmount, action = "unknown") => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: xpAmount } },
      { new: true, session }
    )

    if (!user) {
      await session.abortTransaction()
      return {
        success: false,
        error: "User not found",
      }
    }

    // Calculate new level
    const newLevel = Math.floor(user.xp / 1000) + 1
    const oldLevel = Math.floor((user.xp - xpAmount) / 1000) + 1

    // Update level if changed
    if (newLevel !== oldLevel) {
      user.level = newLevel
      await user.save({ session })
    }

    await session.commitTransaction()

    return {
      success: true,
      newXp: user.xp,
      newLevel,
      leveledUp: newLevel > oldLevel,
      action,
    }
  } catch (error) {
    await session.abortTransaction()
    console.error("XP award transaction error:", error)
    return {
      success: false,
      error: error.message,
    }
  } finally {
    session.endSession()
  }
}

module.exports = {
  atomicEnrollment,
  atomicLessonCompletion,
  atomicXpAward,
}
