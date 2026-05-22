/**
 * Optimistic Updates Utility
 * Provides helpers for instant UI feedback with rollback on failure
 */

/**
 * Base optimistic update function with cache management
 */
export function optimisticUpdate(
  queryClient,
  queryKey,
  updateFn,
  previousData = null
) {
  // Save previous data for rollback
  const snapshot = queryClient.getQueryData(queryKey)

  // Apply optimistic update
  queryClient.setQueryData(queryKey, (old) => updateFn(old))

  return {
    previousData: snapshot,
    rollback: () => {
      if (previousData !== null) {
        queryClient.setQueryData(queryKey, previousData)
      }
    },
  }
}

/**
 * Optimistic enroll update
 */
export function optimisticEnroll(queryClient, courseData) {
  return optimisticUpdate(
    queryClient,
    ['enrolled-courses'],
    (old) => ({
      ...old,
      data: [...((old?.data) || []), courseData],
    })
  )
}

/**
 * Optimistic lesson completion
 */
export function optimisticLessonComplete(
  queryClient,
  courseId,
  lessonId,
  progressData
) {
  const updates = []

  // Update lesson query
  updates.push(
    optimisticUpdate(
      queryClient,
      ['lesson', courseId, lessonId],
      (old) => ({
        ...old,
        data: { ...old?.data, completed: true, ...progressData },
      })
    )
  )

  // Update user profile query
  updates.push(
    optimisticUpdate(
      queryClient,
      ['user-profile'],
      (old) => ({
        ...old,
        data: {
          ...old?.data,
          xp: (old?.data?.xp || 0) + (progressData?.xpAwarded || 0),
          level: progressData?.newLevel || old?.data?.level,
        },
      })
    )
  )

  return {
    rollback: () => updates.forEach((u) => u.rollback()),
  }
}

/**
 * Optimistic course progress update
 */
export function optimisticProgressUpdate(
  queryClient,
  courseId,
  progressUpdate
) {
  return optimisticUpdate(
    queryClient,
    ['course', courseId],
    (old) => ({
      ...old,
      data: {
        ...old?.data,
        progress: {
          ...old?.data?.progress,
          ...progressUpdate,
        },
      },
    })
  )
}

/**
 * Optimistic badge earn
 */
export function optimisticBadgeEarn(queryClient, badge) {
  const updates = []

  // Add to earned badges
  updates.push(
    optimisticUpdate(
      queryClient,
      ['achievements'],
      (old) => ({
        ...old,
        data: [...((old?.data) || []), badge],
      })
    )
  )

  // Remove from remaining badges
  updates.push(
    optimisticUpdate(
      queryClient,
      ['badges-remaining'],
      (old) => ({
        ...old,
        data: (old?.data || []).filter((b) => b.id !== badge.id),
      })
    )
  )

  return {
    rollback: () => updates.forEach((u) => u.rollback()),
  }
}

/**
 * Optimistic quiz completion
 */
export function optimisticQuizComplete(
  queryClient,
  courseId,
  lessonId,
  quizResult
) {
  const updates = []

  // Update quiz
  updates.push(
    optimisticUpdate(
      queryClient,
      ['quiz', courseId, lessonId],
      (old) => ({
        ...old,
        data: {
          ...old?.data,
          lastAttempt: {
            score: quizResult.score,
            passed: quizResult.passed,
            timestamp: new Date(),
          },
        },
      })
    )
  )

  // Update profile with XP
  updates.push(
    optimisticUpdate(
      queryClient,
      ['user-profile'],
      (old) => ({
        ...old,
        data: {
          ...old?.data,
          xp: (old?.data?.xp || 0) + (quizResult.xpAwarded || 0),
          level: quizResult.newLevel || old?.data?.level,
        },
      })
    )
  )

  return {
    rollback: () => updates.forEach((u) => u.rollback()),
  }
}

/**
 * Create optimistic list update for adding item
 */
export function createOptimisticListAdd(queryClient, queryKey, newItem) {
  return optimisticUpdate(
    queryClient,
    queryKey,
    (old) => ({
      ...old,
      data: [newItem, ...(old?.data || [])],
    })
  )
}

/**
 * Create optimistic list update for removing item
 */
export function createOptimisticListRemove(queryClient, queryKey, itemId) {
  return optimisticUpdate(
    queryClient,
    queryKey,
    (old) => ({
      ...old,
      data: (old?.data || []).filter((item) => item._id !== itemId),
    })
  )
}

/**
 * Create optimistic list update for modifying item
 */
export function createOptimisticListUpdate(
  queryClient,
  queryKey,
  itemId,
  updates
) {
  return optimisticUpdate(
    queryClient,
    queryKey,
    (old) => ({
      ...old,
      data: (old?.data || []).map((item) =>
        item._id === itemId ? { ...item, ...updates } : item
      ),
    })
  )
}

/**
 * Batch optimistic updates
 */
export function batchOptimisticUpdates(updateFns) {
  const rollbacks = []

  for (const updateFn of updateFns) {
    const result = updateFn()
    rollbacks.push(result.rollback)
  }

  return {
    rollbackAll: () => rollbacks.forEach((rb) => rb()),
  }
}

/**
 * Optimistic update for field
 */
export function optimisticFieldUpdate(queryClient, queryKey, field, value) {
  return optimisticUpdate(
    queryClient,
    queryKey,
    (old) => ({
      ...old,
      data: {
        ...old?.data,
        [field]: value,
      },
    })
  )
}

/**
 * Optimistic counter increment
 */
export function optimisticCounterIncrement(
  queryClient,
  queryKey,
  field,
  amount = 1
) {
  return optimisticUpdate(
    queryClient,
    queryKey,
    (old) => ({
      ...old,
      data: {
        ...old?.data,
        [field]: (old?.data?.[field] || 0) + amount,
      },
    })
  )
}
