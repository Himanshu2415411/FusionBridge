const crypto = require("crypto")
const { issueCertificate } = require("../services/certificate.service")

const COURSE_COMPLETION_XP = 200
const BASE_LESSON_XP = 10


const completeLessonForUser = async (user, course, lessonId) => {
  const enrollment = user.enrolledCourses.find(
    ec => ec.course.toString() === course._id.toString()
  )

  if (!enrollment) return { completed: false }

  // Check if lesson was already completed
  const alreadyCompleted = enrollment.completedLessons.some(
    id => id.toString() === lessonId.toString()
  )

  if (alreadyCompleted) {
    // Lesson already completed - do NOT award XP or update streak
    return {
      completed: true,
      alreadyCompleted: true,
      message: "Lesson already marked as completed"
    }
  }

  // ---------- Add Lesson (First Completion) ----------
  enrollment.completedLessons.push(lessonId)
  enrollment.lastAccessedLesson = lessonId

  user.activities.unshift({
    type: "lesson_completed",
    courseId: course._id,
    lessonId,
  })

  // ---------- DAILY STREAK ----------
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let lastDate = user.lastLearningDate

  if (lastDate) {
    const last = new Date(lastDate)
    last.setHours(0, 0, 0, 0)

    const diffDays = Math.floor(
      (today - last) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 1) {
      user.currentStreak += 1
    } else if (diffDays > 1) {
      user.currentStreak = 1
    }
  } else {
    user.currentStreak = 1
  }

  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak
  }

  user.lastLearningDate = new Date()

  // ---------- BADGES ----------
  const hasBadge = name =>
    user.badges.some(b => b.name === name)

const awardBadge = (name, icon) => {
  user.badges.push({ name, icon })

  user.activities.unshift({
    type: "badge_earned",
    badgeName: name,
  })

  user.notifications.unshift({
    type: "badge_earned",
    message: `You earned the "${name}" badge!`
  })
}

  if (user.currentStreak === 3 && !hasBadge("3 Day Streak")) {
    awardBadge("3 Day Streak", "🔥")
  }

  if (user.currentStreak === 7 && !hasBadge("7 Day Streak")) {
    awardBadge("7 Day Streak", "🚀")
  }

  if (user.currentStreak === 30 && !hasBadge("30 Day Streak")) {
    awardBadge("30 Day Streak", "🏆")
  }

  // ---------- XP ----------
  let lessonXp = BASE_LESSON_XP

  if (user.currentStreak >= 30) {
    lessonXp += 50
  } else if (user.currentStreak >= 7) {
    lessonXp += 20
  } else if (user.currentStreak >= 3) {
    lessonXp += 10
  }

  user.xp += lessonXp
  user.weeklyXp += lessonXp

  // ---------- COURSE COMPLETION ----------
  const totalLessons = course.totalLessons || 0
  const completedCount = enrollment.completedLessons.length

  if (
    totalLessons > 0 &&
    completedCount === totalLessons &&
    enrollment.isCourseCompleted !== true
  ) {
    enrollment.isCourseCompleted = true
    enrollment.completedAt = new Date()
    enrollment.certificateUnlocked = true

    enrollment.certificateId = crypto
    .randomBytes(8)
    .toString("hex")

    user.coursesCompleted = (user.coursesCompleted || 0) + 1
    
    // Award course completion XP
    user.xp += COURSE_COMPLETION_XP
    user.weeklyXp += COURSE_COMPLETION_XP

    user.activities.unshift({
      type: "course_completed",
      courseId: course._id,
    })
    user.notifications.unshift({
      type: "lesson_completed",
      message: `You completed a lesson in ${course.title}!`
    })
    user.notifications.unshift({
      type: "course_completed",
      message: `Congratulations! You completed ${course.title}.`
    })

    // Issue certificate
    try {
      await issueCertificate(user, course)
    } catch (error) {
      console.error("Error issuing certificate:", error)
    }
  }

  await user.save()

  return { completed: true }
}

module.exports = { completeLessonForUser }