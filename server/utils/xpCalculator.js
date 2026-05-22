/**
 * XP Calculator - Manages XP awards and level calculations
 */

const XP_REWARDS = {
  LESSON_COMPLETED: 10,
  COURSE_COMPLETED: 200,
  QUIZ_PASSED: 20,
  QUIZ_PERFECT: 50, // 100% score
  FIRST_COURSE: 100,
  STREAK_MILESTONE_7: 50,
  STREAK_MILESTONE_30: 200,
  STREAK_MILESTONE_100: 500,
}

/**
 * Calculate level from XP
 * Level = floor(xp / 1000) + 1
 * @param {number} xp - Total XP
 * @returns {number} Level (minimum 1)
 */
const calculateLevel = (xp) => {
  return Math.floor(xp / 1000) + 1
}

/**
 * Get XP needed for next level
 * @param {number} currentXp - Current XP
 * @returns {number} XP needed for next level
 */
const getXpForNextLevel = (currentXp) => {
  const currentLevel = calculateLevel(currentXp)
  const nextLevelXp = currentLevel * 1000
  return Math.max(0, nextLevelXp - currentXp)
}

/**
 * Get XP progress for current level
 * @param {number} xp - Total XP
 * @returns {object} Progress info: {currentLevelXp, nextLevelXp, currentLevelProgress, percent}
 */
const getLevelProgress = (xp) => {
  const currentLevel = calculateLevel(xp)
  const currentLevelXp = (currentLevel - 1) * 1000
  const nextLevelXp = currentLevel * 1000
  const currentLevelProgress = xp - currentLevelXp
  const percent = Math.round((currentLevelProgress / (nextLevelXp - currentLevelXp)) * 100)

  return {
    currentLevelXp,
    nextLevelXp,
    currentLevelProgress,
    percent,
  }
}

/**
 * Award XP and determine level up
 * @param {number} currentXp - Current XP before award
 * @param {number} xpToAward - XP to award
 * @returns {object} Result: {newXp, previousLevel, newLevel, leveledUp}
 */
const awardXp = (currentXp, xpToAward) => {
  const previousLevel = calculateLevel(currentXp)
  const newXp = currentXp + xpToAward
  const newLevel = calculateLevel(newXp)
  const leveledUp = newLevel > previousLevel

  return {
    newXp,
    xpAwarded: xpToAward,
    previousLevel,
    newLevel,
    leveledUp,
    levelupCount: newLevel - previousLevel,
  }
}

/**
 * Get milestone badges for XP thresholds
 * @param {number} xp - Current XP
 * @returns {array} Array of earned milestone badges
 */
const getXpMilestones = (xp) => {
  const milestones = [
    { xp: 1000, badge: 'Beginner', level: 2 },
    { xp: 5000, badge: 'Intermediate', level: 6 },
    { xp: 10000, badge: 'Advanced', level: 11 },
    { xp: 50000, badge: 'Master', level: 51 },
    { xp: 100000, badge: 'Legend', level: 101 },
  ]

  return milestones.filter((m) => xp >= m.xp)
}

/**
 * Calculate XP reward based on quiz performance
 * @param {number} scorePercent - Score percentage (0-100)
 * @param {boolean} isPerfect - Is it a perfect score?
 * @returns {object} Result: {xp, message}
 */
const getQuizXpReward = (scorePercent, isPerfect) => {
  if (isPerfect) {
    return {
      xp: XP_REWARDS.QUIZ_PERFECT,
      message: 'Perfect Score! Earned 50 XP',
    }
  }

  if (scorePercent >= 80) {
    return {
      xp: XP_REWARDS.QUIZ_PASSED,
      message: `Quiz Passed! Earned ${XP_REWARDS.QUIZ_PASSED} XP`,
    }
  }

  return {
    xp: 0,
    message: 'Quiz not passed. Try again to earn XP',
  }
}

/**
 * Build XP summary for user response
 * @param {object} user - User document with xp, level
 * @param {number} xpAwarded - XP that was awarded
 * @returns {object} XP summary
 */
const buildXpSummary = (user, xpAwarded) => {
  const previousLevel = calculateLevel(user.xp - xpAwarded)
  const currentLevel = user.level
  const leveledUp = currentLevel > previousLevel

  return {
    xpAwarded,
    totalXp: user.xp,
    currentLevel,
    previousLevel,
    leveledUp,
    nextLevelXp: getXpForNextLevel(user.xp),
    progress: getLevelProgress(user.xp),
  }
}

module.exports = {
  XP_REWARDS,
  calculateLevel,
  getXpForNextLevel,
  getLevelProgress,
  awardXp,
  getXpMilestones,
  getQuizXpReward,
  buildXpSummary,
}
