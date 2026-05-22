'use client'

import { useState } from 'react'
import { useCourses } from '@/hooks/useQueries'
import { Button } from '@/components/ui/button'
import { CourseGridSkeleton } from '@/components/skeletons'
import { CourseCardOptimized } from '@/components/modules/unibridge/course-card-optimized'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Course Grid with React Query Caching and Pagination
 * Features:
 * - Automatic caching (5 minute stale time)
 * - Pagination with page buttons
 * - Skeleton loading states
 * - Optimistic updates on enrollment
 */
export function CourseGridPaginated({ limit = 12 }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error } = useCourses(page, limit)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Failed to load courses</p>
        <p className="text-gray-600 text-sm mt-1">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return <CourseGridSkeleton count={limit} />
  }

  const courses = data?.data || []
  const pagination = data?.pagination || {}
  const hasNextPage = pagination.hasMore
  const hasPrevPage = page > 1

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className={isFetching ? 'opacity-50' : ''}>
            <CourseCardOptimized course={course} />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {(hasNextPage || hasPrevPage) && (
        <div className="flex items-center justify-between py-6 border-t">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={!hasPrevPage || isFetching}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page <span className="font-semibold">{page}</span> of{' '}
              <span className="font-semibold">{pagination.totalPages}</span>
            </span>
            {pagination.total && (
              <span className="text-xs text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </div>

          <Button
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage || isFetching}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {isFetching && (
        <div className="text-center">
          <p className="text-sm text-gray-500">Loading courses...</p>
        </div>
      )}
    </div>
  )
}

/**
 * Infinite scroll course grid
 * Automatically loads more courses as user scrolls
 */
export function CourseGridInfiniteScroll({ limit = 12 }) {
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteCourses(limit)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Failed to load courses</p>
      </div>
    )
  }

  if (isLoading) {
    return <CourseGridSkeleton count={limit} />
  }

  const allCourses = data?.pages.flatMap((page) => page.data) || []

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCourses.map((course) => (
          <div key={course._id}>
            <CourseCardOptimized course={course} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center py-6">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetching}
            variant="outline"
            size="lg"
          >
            {isFetching ? 'Loading...' : 'Load More Courses'}
          </Button>
        </div>
      )}

      {/* End of list */}
      {!hasNextPage && allCourses.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No more courses to load</p>
        </div>
      )}
    </div>
  )
}

/**
 * Course grid with search and filters
 */
export function CourseGridFiltered() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useCourses(page, 12)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1) // Reset to first page on search
        }}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Grid */}
      {isLoading ? (
        <CourseGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((course) => (
            <CourseCardOptimized key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
