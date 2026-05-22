/**
 * Next.js Code Splitting and Dynamic Imports Configuration
 * Implements lazy loading for heavy components to improve page load performance
 */

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { PageLoadSkeleton, CourseGridSkeleton, VideoPlayerSkeleton } from '@/components/skeletons'

// ============================================================================
// HEAVY COMPONENTS - LAZY LOADED
// ============================================================================

/**
 * Quiz Component - Heavy (contains Zod validation, state management)
 */
export const QuizComponentLazy = dynamic(
  () => import('@/components/modules/unibridge/quiz-component'),
  {
    loading: () => <div className="p-6 bg-white rounded-lg shadow">Loading quiz...</div>,
    ssr: false, // Don't render on server
  }
)

/**
 * Video Player - Heavy (HLS.js library)
 * Only load when user scrolls to video
 */
export const VideoPlayerLazy = dynamic(
  () => import('@/components/video-player').then(mod => mod.LessonVideoPlayer),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
)

/**
 * Course Grid - Moderate (pagination, filtering)
 */
export const CourseGridPaginatedLazy = dynamic(
  () => import('@/components/modules/unibridge/course-grid-paginated').then(mod => mod.CourseGridPaginated),
  {
    loading: () => <CourseGridSkeleton />,
    ssr: false,
  }
)

/**
 * Leaderboard - Moderate (data sorting, pagination)
 */
export const GlobalLeaderboardLazy = dynamic(
  () => import('@/components/modules/unibridge/leaderboard-global').then(mod => mod.GlobalLeaderboard),
  {
    loading: () => <div className="p-6 bg-white rounded-lg shadow">Loading leaderboard...</div>,
    ssr: false,
  }
)

/**
 * Analytics Dashboard - Heavy (charts, calculations)
 */
export const AnalyticsDashboardLazy = dynamic(
  () => import('@/components/modules/unibridge/analytics-dashboard'),
  {
    loading: () => <PageLoadSkeleton />,
    ssr: false,
  }
)

/**
 * Community Forum - Heavy (rich text, nested comments)
 */
export const CommunityForumLazy = dynamic(
  () => import('@/components/modules/community/forum'),
  {
    loading: () => <div className="p-6 bg-white rounded-lg shadow">Loading forum...</div>,
    ssr: false,
  }
)

/**
 * Create Course Form - Heavy (multi-step form, file upload)
 */
export const CreateCourseLazy = dynamic(
  () => import('@/components/modules/unibridge/create-course'),
  {
    loading: () => <div className="p-6 bg-white rounded-lg shadow">Loading form...</div>,
    ssr: false,
  }
)

// ============================================================================
// ROUTE-BASED CODE SPLITTING
// ============================================================================

/**
 * Use in app/layout or route handlers to lazy load entire modules
 * Example:
 * const AdminDashboard = dynamic(() => import('@/app/admin'), { ssr: false })
 */

export const AdminPanelLazy = dynamic(
  () => import('@/app/(protected)/admin'),
  {
    loading: () => <PageLoadSkeleton />,
    ssr: false,
  }
)

export const InstructorDashboardLazy = dynamic(
  () => import('@/app/(protected)/instructor'),
  {
    loading: () => <PageLoadSkeleton />,
    ssr: false,
  }
)

// ============================================================================
// OPTIMIZATION PATTERNS
// ============================================================================

/**
 * Pattern 1: Lazy load component on interaction
 * Usage:
 * const [showAdvanced, setShowAdvanced] = useState(false)
 * const AdvancedSettingsLazy = showAdvanced ? 
 *   dynamic(() => import('@/components/advanced-settings')) : null
 * 
 * <button onClick={() => setShowAdvanced(true)}>Show Settings</button>
 * {AdvancedSettingsLazy && <AdvancedSettingsLazy />}
 */

/**
 * Pattern 2: Conditional lazy loading based on route
 * Usage in middleware or layout:
 * 
 * if (isAdminRoute) {
 *   const AdminComponent = dynamic(() => import('@/admin'), { ssr: false })
 * }
 */

/**
 * Pattern 3: Suspense boundary for better loading states
 * Usage:
 * <Suspense fallback={<LoadingSkeleton />}>
 *   <LazySections />
 * </Suspense>
 */

// ============================================================================
// NEXT.JS IMAGE OPTIMIZATION PRESETS
// ============================================================================

export const imageOptimizationPresets = {
  // Thumbnail optimization
  thumbnail: {
    width: 200,
    height: 200,
    quality: 75,
    sizes: '(max-width: 768px) 100vw, 200px',
  },

  // Hero image optimization
  hero: {
    width: 1920,
    height: 1080,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, 100vw',
  },

  // Course card image
  courseCard: {
    width: 400,
    height: 250,
    quality: 80,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },

  // Avatar image
  avatar: {
    width: 64,
    height: 64,
    quality: 75,
    sizes: '64px',
  },

  // Background image
  background: {
    width: 1920,
    height: 1080,
    quality: 70,
    sizes: '100vw',
    blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAIAAABf9F5fAAAACklEQVQIHWNgYAAAABAAEY+9FwAAAABJRU5ErkJggg==',
  },
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Monitor component load times
 * Call in component: useEffect(() => { logComponentMetric('ComponentName', loadTime) }, [])
 */
export function logComponentMetric(componentName, loadTime) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} loaded in ${loadTime}ms`)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'component_load', {
      component: componentName,
      load_time: loadTime,
    })
  }
}

/**
 * Performance API wrapper
 */
export function measureComponentPerformance(componentName, fn) {
  const start = performance.now()
  fn()
  const end = performance.now()
  logComponentMetric(componentName, Math.round(end - start))
}
