const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")
const QuizAttempt = require("../models/QuizAttempt")
const { recordQuizAttempt } = require("../services/quizAttempt.service")
const { ApiResponse } = require("../utils/apiResponse")
const { logActivity, ACTIVITY_TYPES } = require("../services/activityLogger")
const { awardXp, getQuizXpReward, buildXpSummary } = require("../utils/xpCalculator")
const { getBadgesForEvent, getBadgeDetails } = require("../utils/badgeEarner")
const { quizLimiter } = require("../middleware/rateLimiting")

/**
 * Submit quiz answers
 * POST /api/lessons/:lessonId/quiz
 */
const submitQuiz = async (req, res) => {
  try {
    const { lessonId, courseId } = req.params || req.body
    const { answers } = req.body
    const userId = req.user._id

    // Find course containing this lesson
    const course = await Course.findOne({
      $or: [
        { "curriculum.lessons._id": lessonId },
        { _id: courseId },
      ],
    })

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    // Find lesson inside course
    let lesson = null

    for (const section of course.curriculum) {
      lesson = section.lessons.find(
        (l) => l._id.toString() === lessonId
      )
      if (lesson) break
    }

    if (!lesson) {
      return res.status(404).json(
        new ApiResponse(404, null, "Lesson not found").toJSON()
      )
    }

    const quiz = lesson.quiz || []

    if (quiz.length === 0) {
      return res.status(400).json(
        new ApiResponse(400, null, "This lesson has no quiz").toJSON()
      )
    }

    // Evaluate answers
    let correctAnswers = 0

    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++
      }
    })

    const totalQuestions = quiz.length
    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = score >= 60
    const isPerfect = score === 100

    // Store attempt
    await recordQuizAttempt(
      userId,
      course._id,
      lessonId,
      answers,
      score,
      correctAnswers,
      totalQuestions,
      passed
    )

    // Get user for XP/badge updates
    const user = await User.findById(userId)

    let xpAwarded = 0
    let badgesEarned = []
    let leveledUp = false

    if (passed) {
      // Award XP for passing quiz
      const quizXpReward = getQuizXpReward(score, isPerfect)
      xpAwarded = quizXpReward.xp

      if (xpAwarded > 0) {
        const xpResult = awardXp(user.xp, xpAwarded)
        user.xp = xpResult.newXp
        user.level = xpResult.newLevel
        leveledUp = xpResult.leveledUp

        // Check for badge eligibility
        const attemptCount = await QuizAttempt.countDocuments({
          user: userId,
          passed: true,
        })

        badgesEarned = getBadgesForEvent('quiz_passed', {
          quizzesPassed: attemptCount + 1,
          perfectScores: isPerfect ? 1 : 0,
          isPerfectScore: isPerfect,
        })

        // Add badges to user
        for (const badgeId of badgesEarned) {
          const badge = getBadgeDetails(badgeId)
          if (badge && !user.badges.find(b => b.name === badge.name)) {
            user.badges.push({
              name: badge.name,
              icon: badge.icon,
              earnedAt: new Date(),
            })
            // Award badge XP
            user.xp += badge.xp
            user.level = Math.floor(user.xp / 1000) + 1
          }
        }

        await user.save()

        // Log activities
        await logActivity(userId, ACTIVITY_TYPES.QUIZ_PASSED, {
          courseId: course._id,
          courseName: course.title,
          quizScore: score,
        })

        if (leveledUp) {
          await logActivity(userId, ACTIVITY_TYPES.LEVEL_UP, {
            newLevel: user.level,
            totalXp: user.xp,
          })
        }

        for (const badgeId of badgesEarned) {
          const badge = getBadgeDetails(badgeId)
          if (badge) {
            await logActivity(userId, ACTIVITY_TYPES.BADGE_EARNED, {
              badgeName: badge.name,
              badgeId: badge.id,
              icon: badge.icon,
            })
          }
        }
      }
    } else {
      // Log quiz attempt even if failed
      await logActivity(userId, ACTIVITY_TYPES.QUIZ_ATTEMPTED, {
        courseId: course._id,
        courseName: course.title,
        quizScore: score,
      })
    }

    return res.json(
      new ApiResponse(
        200,
        {
          score,
          correctAnswers,
          totalQuestions,
          passed,
          xpAwarded,
          badgesEarned: badgesEarned.map(id => {
            const badge = getBadgeDetails(id)
            return {
              id,
              name: badge?.name,
              icon: badge?.icon,
            }
          }),
          leveledUp,
          newLevel: user.level,
          totalXp: user.xp,
        },
        passed ? "Quiz passed! You earned XP and badges!" : "Quiz failed. Try again!"
      ).toJSON()
    )
  } catch (error) {
    console.error("Quiz submission error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Get quiz attempt history
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { lessonId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      })
    }

    const attempts = await QuizAttempt.find({
      user: userId,
      lesson: lessonId,
    })
      .sort({ createdAt: -1 })
      .select(
        "attemptNumber score correctAnswers totalQuestions passed createdAt"
      )

    res.json({
      success: true,
      count: attempts.length,
      attempts,
    })
  } catch (error) {
    console.error("Get quiz attempts error:", error)

    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  submitQuiz,
  getQuizAttempts,
}