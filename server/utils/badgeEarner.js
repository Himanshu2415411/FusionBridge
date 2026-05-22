/**
 * Badge Earner - Manages badge earning and milestone tracking
 */

const BADGES = {
  // Learning Badges
  FIRST_COURSE: {
    id: 'first_course',
    name: 'First Step',
    icon: '🎓',
    description: 'Completed your first course',
    xp: 100,
  },
  LESSON_MASTER_10: {
    id: 'lesson_master_10',
    name: 'Lesson Master',
    icon: '📚',
    description: 'Completed 10 lessons',
    xp: 50,
  },
  LESSON_MASTER_50: {
    id: 'lesson_master_50',
    name: 'Super Learner',
    icon: '🚀',
    description: 'Completed 50 lessons',
    xp: 150,
  },
  COURSE_COMPLETION_5: {
    id: 'course_completion_5',
    name: 'Course Collector',
    icon: '🎯',
    description: 'Completed 5 courses',
    xp: 200,
  },
  COURSE_COMPLETION_10: {
    id: 'course_completion_10',
    name: 'Expert Developer',
    icon: '⭐',
    description: 'Completed 10 courses',
    xp: 500,
  },

  // Streak Badges
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    icon: '🔥',
    description: '7-day learning streak',
    xp: 50,
  },
  MONTHLY_MASTER: {
    id: 'monthly_master',
    name: 'Monthly Master',
    icon: '🌟',
    description: '30-day learning streak',
    xp: 200,
  },
  CENTURY_CHAMPION: {
    id: 'century_champion',
    name: 'Century Champion',
    icon: '👑',
    description: '100-day learning streak',
    xp: 500,
  },
  YEARLY_LEGEND: {
    id: 'yearly_legend',
    name: 'Yearly Legend',
    icon: '💎',
    description: '365-day learning streak',
    xp: 1000,
  },

  // Quiz Badges
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    icon: '🎪',
    description: 'Passed 10 quizzes',
    xp: 100,
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    icon: '💯',
    description: 'Achieved 100% on a quiz',
    xp: 75,
  },

  // Speed Badges
  SPEED_LEARNER: {
    id: 'speed_learner',
    name: 'Speed Learner',
    icon: '⚡',
    description: 'Completed a lesson in under 5 minutes',
    xp: 25,
  },
  RAPID_COMPLETER: {
    id: 'rapid_completer',
    name: 'Rapid Completer',
    icon: '🏃',
    description: 'Completed 5 courses in 2 weeks',
    xp: 150,
  },
}

/**
 * Check if badge should be earned
 * @param {string} badgeId - Badge ID to check
 * @param {object} stats - User stats {lessonsCompleted, coursesCompleted, quizzesPassed, currentStreak}
 * @returns {boolean} Whether badge should be earned
 */
const shouldEarnBadge = (badgeId, stats) => {
  switch (badgeId) {
    case 'first_course':
      return stats.coursesCompleted >= 1
    case 'lesson_master_10':
      return stats.lessonsCompleted >= 10
    case 'lesson_master_50':
      return stats.lessonsCompleted >= 50
    case 'course_completion_5':
      return stats.coursesCompleted >= 5
    case 'course_completion_10':
      return stats.coursesCompleted >= 10
    case 'week_warrior':
      return stats.currentStreak >= 7
    case 'monthly_master':
      return stats.currentStreak >= 30
    case 'century_champion':
      return stats.currentStreak >= 100
    case 'yearly_legend':
      return stats.currentStreak >= 365
    case 'quiz_master':
      return stats.quizzesPassed >= 10
    case 'perfect_score':
      return stats.perfectScores >= 1
    case 'speed_learner':
      return stats.speedLearnerCount >= 1
    case 'rapid_completer':
      return stats.rapidCompleterCount >= 1
    default:
      return false
  }
}

/**
 * Get badges earned for milestone
 * @param {string} eventType - Event type: 'course_completed', 'lesson_completed', 'quiz_passed', 'streak_milestone'
 * @param {object} stats - Current user stats
 * @returns {array} Array of badge IDs earned
 */
const getBadgesForEvent = (eventType, stats) => {
  const earnedBadges = []

  switch (eventType) {
    case 'course_completed':
      if (shouldEarnBadge('first_course', stats)) earnedBadges.push('first_course')
      if (shouldEarnBadge('course_completion_5', stats)) earnedBadges.push('course_completion_5')
      if (shouldEarnBadge('course_completion_10', stats)) earnedBadges.push('course_completion_10')
      break

    case 'lesson_completed':
      if (shouldEarnBadge('lesson_master_10', stats)) earnedBadges.push('lesson_master_10')
      if (shouldEarnBadge('lesson_master_50', stats)) earnedBadges.push('lesson_master_50')
      break

    case 'quiz_passed':
      if (shouldEarnBadge('quiz_master', stats)) earnedBadges.push('quiz_master')
      if (stats.isPerfectScore && shouldEarnBadge('perfect_score', stats))
        earnedBadges.push('perfect_score')
      break

    case 'streak_milestone':
      if (shouldEarnBadge('week_warrior', stats)) earnedBadges.push('week_warrior')
      if (shouldEarnBadge('monthly_master', stats)) earnedBadges.push('monthly_master')
      if (shouldEarnBadge('century_champion', stats)) earnedBadges.push('century_champion')
      if (shouldEarnBadge('yearly_legend', stats)) earnedBadges.push('yearly_legend')
      break
  }

  return earnedBadges
}

/**
 * Get badge details
 * @param {string} badgeId - Badge ID
 * @returns {object} Badge details
 */
const getBadgeDetails = (badgeId) => {
  return BADGES[badgeId.toUpperCase().replace(/-/g, '_')] || null
}

/**
 * Calculate total XP from badges
 * @param {array} badgeIds - Array of badge IDs
 * @returns {number} Total XP
 */
const calculateBadgeXp = (badgeIds) => {
  return badgeIds.reduce((total, badgeId) => {
    const badge = getBadgeDetails(badgeId)
    return total + (badge?.xp || 0)
  }, 0)
}

/**
 * Get all available badges
 * @returns {array} Array of all badge definitions
 */
const getAllBadges = () => {
  return Object.values(BADGES)
}

/**
 * Get badges user is progressing towards
 * @param {object} userBadges - User's earned badges
 * @returns {array} Badges not yet earned
 */
const getRemainingBadges = (userBadges = []) => {
  const earnedIds = userBadges.map((b) => b.id || b)
  return Object.values(BADGES).filter((badge) => !earnedIds.includes(badge.id))
}

module.exports = {
  BADGES,
  shouldEarnBadge,
  getBadgesForEvent,
  getBadgeDetails,
  calculateBadgeXp,
  getAllBadges,
  getRemainingBadges,
}
