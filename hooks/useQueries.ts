'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Fetch courses with pagination and caching
 */
export function useCourses(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['courses', page, limit],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/courses?page=${page}&limit=${limit}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch courses')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Infinite scroll courses
 */
export function useInfiniteCourses(limit = 12) {
  return useInfiniteQuery({
    queryKey: ['courses-infinite', limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`${API_URL}/courses?page=${pageParam}&limit=${limit}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch courses')
      return res.json()
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.pagination?.hasMore) {
        return pages.length + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Fetch single course details
 */
export function useCourse(courseId) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/courses/${courseId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch course')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
    enabled: !!courseId,
  })
}

/**
 * Fetch user's enrolled courses
 */
export function useEnrolledCourses(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['enrolled-courses', page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/users/enrolled-courses?page=${page}&limit=${limit}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch enrolled courses')
      return res.json()
    },
    staleTime: 1000 * 60 * 1, // 1 minute for progress
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users/profile`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Fetch lesson details
 */
export function useLesson(courseId, lessonId) {
  return useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/lessons/${courseId}/${lessonId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch lesson')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
    enabled: !!courseId && !!lessonId,
  })
}

/**
 * Fetch lesson quiz
 */
export function useQuiz(courseId, lessonId) {
  return useQuery({
    queryKey: ['quiz', courseId, lessonId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/lessons/${courseId}/${lessonId}/quiz`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch quiz')
      return res.json()
    },
    staleTime: 1000 * 60 * 60, // 1 hour - quizzes don't change often
    gcTime: 1000 * 60 * 60 * 2,
    enabled: !!courseId && !!lessonId,
  })
}

/**
 * Fetch course achievements
 */
export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/badges/user/my-badges`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch achievements')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Fetch activity feed
 */
export function useActivityFeed(limit = 20) {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/activity/feed?limit=${limit}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch activity')
      return res.json()
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch global leaderboard
 */
export function useLeaderboard(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['leaderboard', page, limit],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/leaderboard?page=${page}&limit=${limit}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Fetch analytics dashboard
 */
export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/analytics/dashboard`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Enroll in course with optimistic updates
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (courseId) => {
      const res = await fetch(`${API_URL}/progress/enroll/${courseId}`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to enroll')
      return res.json()
    },
    onMutate: async (courseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['courses'] })
      await queryClient.cancelQueries({ queryKey: ['enrolled-courses'] })

      // Snapshot previous data
      const previousCourses = queryClient.getQueryData(['courses'])
      const previousEnrolled = queryClient.getQueryData(['enrolled-courses'])

      // Update cache optimistically
      queryClient.setQueryData(['enrolled-courses'], (old) => ({
        ...old,
        data: [
          ...((old?.data) || []),
          { ...queryClient.getQueryData(['course', courseId]), enrolled: true },
        ],
      }))

      return { previousCourses, previousEnrolled }
    },
    onError: (err, courseId, context) => {
      // Rollback on error
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses)
      }
      if (context?.previousEnrolled) {
        queryClient.setQueryData(['enrolled-courses'], context.previousEnrolled)
      }
      toast({
        title: 'Error',
        description: 'Failed to enroll in course',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] })
      toast({
        title: 'Success',
        description: 'Enrolled in course successfully!',
      })
    },
  })
}

/**
 * Submit quiz with optimistic updates
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payload) => {
      const { courseId, lessonId, answers } = payload
      const res = await fetch(
        `${API_URL}/lessons/${courseId}/${lessonId}/quiz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
          credentials: 'include',
        }
      )
      if (!res.ok) throw new Error('Failed to submit quiz')
      return res.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate quiz and user profile caches
      queryClient.invalidateQueries({
        queryKey: ['quiz', variables.courseId, variables.lessonId],
      })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit quiz',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Mark lesson as complete with optimistic updates
 */
export function useCompleteLessonMutation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ courseId, lessonId, watchPercentage }) => {
      const res = await fetch(`${API_URL}/progress/lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId,
          watchPercentage: watchPercentage || 100,
        }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to complete lesson')
      return res.json()
    },
    onMutate: async (variables) => {
      // Optimistically update lesson and profile data
      await queryClient.cancelQueries({ queryKey: ['lesson'] })
      await queryClient.cancelQueries({ queryKey: ['user-profile'] })

      const previousProfile = queryClient.getQueryData(['user-profile'])
      const previousLesson = queryClient.getQueryData([
        'lesson',
        variables.courseId,
        variables.lessonId,
      ])

      return { previousProfile, previousLesson }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({
        queryKey: ['lesson', variables.courseId, variables.lessonId],
      })
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['user-profile'], context.previousProfile)
      }
      if (context?.previousLesson) {
        queryClient.setQueryData(
          ['lesson', variables.courseId, variables.lessonId],
          context.previousLesson
        )
      }
    },
  })
}

/**
 * Create course mutation
 */
export function useCreateCourseMutation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (courseData) => {
      const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create course')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Success',
        description: 'Course created successfully!',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create course',
        variant: 'destructive',
      })
    },
  })
}
