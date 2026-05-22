'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useEnrollCourse } from '@/hooks/useQueries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage, CourseImageCard } from '@/components/optimized-image'
import { Users, BookOpen, BarChart3, Loader2 } from 'lucide-react'
import { getCourseId } from '@/lib/id-utils'

/**
 * Optimized Course Card with Caching and Optimistic Updates
 * Features:
 * - Optimistic enrollment updates
 * - Rollback on failure
 * - Fast UI feedback
 * - Image lazy loading
 */
export function CourseCardOptimized({
  course,
  showEnrollButton = true,
  onEnrollSuccess,
}) {
  const router = useRouter()
  const enrollMutation = useEnrollCourse()
  const [isEnrolling, setIsEnrolling] = useState(false)

  const courseId = getCourseId(course)
  const isEnrolled = course.isEnrolled || false
  const progress = course.progress || 0

  const handleEnroll = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setIsEnrolling(true)
    try {
      await enrollMutation.mutateAsync(courseId)
      onEnrollSuccess?.(course)
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleClick = () => {
    if (isEnrolled) {
      router.push(`/unibridge/courses/${courseId}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
        isEnrolled ? 'cursor-pointer' : ''
      }`}
    >
      {/* Image */}
      <CourseImageCard
        src={course.thumbnail || '/course-placeholder.png'}
        alt={course.title}
        title={course.title}
        category={course.category}
        containerClassName="h-48"
      />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          {course.instructor?.avatar && (
            <OptimizedImage
              src={course.instructor.avatar}
              alt={course.instructor.firstName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
              containerClassName="w-8 h-8 rounded-full"
              sizes="32px"
            />
          )}
          <span className="text-xs text-gray-600">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-xs text-gray-600">
          {course.studentCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{course.studentCount}</span>
            </div>
          )}
          {course.lessonCount && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{course.lessonCount} lessons</span>
            </div>
          )}
          {course.level && (
            <Badge variant="outline" className="text-xs">
              {course.level}
            </Badge>
          )}
        </div>

        {/* Progress or Enroll */}
        {isEnrolled && progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Button */}
        <div className="pt-2">
          {!isEnrolled && showEnrollButton ? (
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling || enrollMutation.isPending}
              className="w-full"
              variant={isEnrolled ? 'outline' : 'default'}
            >
              {isEnrolling || enrollMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          ) : isEnrolled ? (
            <Button
              onClick={handleClick}
              className="w-full"
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
