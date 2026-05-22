'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Skeleton for course card
 */
export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4 bg-gray-200" />
        <Skeleton className="h-4 w-full bg-gray-200" />
        <Skeleton className="h-4 w-5/6 bg-gray-200" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-20 bg-gray-200" />
          <Skeleton className="h-8 w-20 bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

/**
 * Grid of skeleton course cards with shimmer effect
 */
export function CourseGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <CourseCardSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for lesson card
 */
export function LessonCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <Skeleton className="h-6 w-full bg-gray-200" />
      <Skeleton className="h-4 w-3/4 bg-gray-200" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-16 bg-gray-200" />
        <Skeleton className="h-8 w-16 bg-gray-200" />
      </div>
    </div>
  )
}

/**
 * Skeleton for lesson list
 */
export function LessonListSkeleton({ count = 8 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <LessonCardSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for badge/achievement card
 */
export function BadgeCardSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Skeleton className="h-16 w-16 rounded-full bg-gray-200" />
      <Skeleton className="h-4 w-20 bg-gray-200" />
      <Skeleton className="h-3 w-24 bg-gray-200" />
    </div>
  )
}

/**
 * Grid of badge skeletons
 */
export function BadgeGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <BadgeCardSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for quiz question
 */
export function QuizQuestionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-full bg-gray-200" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for quiz section
 */
export function QuizSectionSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <QuizQuestionSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for activity item
 */
export function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 p-3 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
        <Skeleton className="h-3 w-1/2 bg-gray-200" />
      </div>
    </div>
  )
}

/**
 * Skeleton for activity feed
 */
export function ActivityFeedSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <ActivityItemSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for leaderboard entry
 */
export function LeaderboardEntrySkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg">
      <Skeleton className="h-8 w-8 bg-gray-200" />
      <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
        <Skeleton className="h-3 w-1/2 bg-gray-200" />
      </div>
      <Skeleton className="h-6 w-12 bg-gray-200" />
    </div>
  )
}

/**
 * Skeleton for leaderboard
 */
export function LeaderboardSkeleton({ count = 10 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <LeaderboardEntrySkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for dashboard card
 */
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <Skeleton className="h-6 w-1/3 bg-gray-200" />
      <Skeleton className="h-8 w-1/2 bg-gray-200" />
      <Skeleton className="h-4 w-full bg-gray-200" />
    </div>
  )
}

/**
 * Skeleton for full page load
 */
export function PageLoadSkeleton() {
  return (
    <div className="space-y-8 p-4">
      <Skeleton className="h-10 w-1/3 bg-gray-200" />
      <CourseGridSkeleton count={6} />
    </div>
  )
}

/**
 * Video player skeleton
 */
export function VideoPlayerSkeleton() {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <Skeleton className="w-full h-96 bg-gray-800" />
      <div className="p-4 bg-gray-900 space-y-2">
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-2 w-full bg-gray-700" />
      </div>
    </div>
  )
}

/**
 * Profile skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-24 w-24 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/2 bg-gray-200" />
          <Skeleton className="h-4 w-3/4 bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <DashboardCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full bg-gray-200" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <TableRowSkeleton columns={columns} />
          </div>
        ))}
      </tbody>
    </table>
  )
}
