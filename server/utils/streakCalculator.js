/**
 * Streak Calculator - Manages learning streaks and milestones
 */

/**
 * Calculate current streak
 * @param {Date} lastActivityDate - Last activity timestamp
 * @returns {object} Result: {currentStreak, isActive}
 */
const calculateCurrentStreak = (lastActivityDate) => {
  if (!lastActivityDate) {
    return { currentStreak: 0, isActive: false }
  }

  const now = new Date()
  const lastActivity = new Date(lastActivityDate)
  const diffTime = Math.abs(now - lastActivity)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // If last activity was more than 2 days ago, streak is broken
  if (diffDays > 2) {
    return { currentStreak: 0, isActive: false }
  }

  // If last activity was today or yesterday, streak is active
  return { currentStreak: 1, isActive: true }
}

/**
 * Update streak based on activity
 * @param {number} longestStreak - Longest streak so far
 * @param {number} currentStreak - Current streak
 * @param {Date} lastActivityDate - Last activity date
 * @param {boolean} wasActivityToday - Was there activity today?
 * @returns {object} Result: {longestStreak, currentStreak, lastActivityDate}
 */
const updateStreak = (longestStreak, currentStreak, lastActivityDate, wasActivityToday) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActivity = lastActivityDate ? new Date(lastActivityDate) : null
  const lastActivityDay = lastActivity ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()) : null

  // If activity was today, don't increment streak
  if (wasActivityToday) {
    return {
      longestStreak,
      currentStreak,
      lastActivityDate: now,
    }
  }

  // Check if last activity was yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (lastActivityDay && lastActivityDay.getTime() === yesterday.getTime()) {
    // Increment streak
    const newCurrentStreak = currentStreak + 1
    const newLongestStreak = Math.max(longestStreak, newCurrentStreak)

    return {
      longestStreak: newLongestStreak,
      currentStreak: newCurrentStreak,
      lastActivityDate: now,
    }
  }

  // Streak was broken, reset to 1
  return {
    longestStreak,
    currentStreak: 1,
    lastActivityDate: now,
  }
}

/**
 * Check if streak milestone is reached
 * @param {number} streak - Current streak
 * @returns {object} Milestone info or null
 */
const checkStreakMilestone = (streak) => {
  const milestones = [
    { streak: 7, badge: 'Week Warrior', xp: 50 },
    { streak: 30, badge: 'Monthly Master', xp: 200 },
    { streak: 100, badge: 'Century Champion', xp: 500 },
    { streak: 365, badge: 'Yearly Legend', xp: 1000 },
  ]

  for (const milestone of milestones) {
    if (streak === milestone.streak) {
      return milestone
    }
  }

  return null
}

/**
 * Get next streak milestone
 * @param {number} streak - Current streak
 * @returns {object} Next milestone info
 */
const getNextStreakMilestone = (streak) => {
  const milestones = [
    { streak: 7, badge: 'Week Warrior', xp: 50 },
    { streak: 30, badge: 'Monthly Master', xp: 200 },
    { streak: 100, badge: 'Century Champion', xp: 500 },
    { streak: 365, badge: 'Yearly Legend', xp: 1000 },
  ]

  for (const milestone of milestones) {
    if (streak < milestone.streak) {
      return {
        ...milestone,
        daysRemaining: milestone.streak - streak,
      }
    }
  }

  return null
}

/**
 * Format streak display
 * @param {number} currentStreak - Current streak
 * @param {number} longestStreak - Longest streak
 * @returns {string} Formatted streak string
 */
const formatStreakDisplay = (currentStreak, longestStreak) => {
  if (currentStreak === 0) {
    return `Longest Streak: ${longestStreak} days 🔥`
  }

  return `Current Streak: ${currentStreak} days 🔥 | Best: ${longestStreak} days`
}

module.exports = {
  calculateCurrentStreak,
  updateStreak,
  checkStreakMilestone,
  getNextStreakMilestone,
  formatStreakDisplay,
}
