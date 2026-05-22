import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

/**
 * Activity Feed Component - Display user activities and achievements
 */
export function ActivityFeedComponent({ limit = 10 }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchActivities()
  }, [skip])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activity?limit=${limit}&skip=${skip}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch activities')

      const data = await response.json()
      if (skip === 0) {
        setActivities(data.data.activities)
      } else {
        setActivities((prev) => [...prev, ...data.data.activities])
      }
      setHasMore(data.data.pagination.hasMore)
    } catch (error) {
      console.error('Fetch activities error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load activities',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      lesson_started: '📖',
      lesson_completed: '✓',
      course_started: '🎓',
      course_completed: '🎉',
      quiz_attempted: '❓',
      quiz_passed: '✓',
      badge_earned: '🏆',
      level_up: '⬆️',
      streak_milestone: '🔥',
      certificate_earned: '📜',
    }
    return icons[type] || '📝'
  }

  const getActivityColor = (type) => {
    const colors = {
      lesson_started: 'bg-blue-100 text-blue-900',
      lesson_completed: 'bg-green-100 text-green-900',
      course_started: 'bg-purple-100 text-purple-900',
      course_completed: 'bg-orange-100 text-orange-900',
      quiz_attempted: 'bg-yellow-100 text-yellow-900',
      quiz_passed: 'bg-green-100 text-green-900',
      badge_earned: 'bg-yellow-100 text-yellow-900',
      level_up: 'bg-purple-100 text-purple-900',
      streak_milestone: 'bg-red-100 text-red-900',
      certificate_earned: 'bg-pink-100 text-pink-900',
    }
    return colors[type] || 'bg-gray-100 text-gray-900'
  }

  const formatTime = (date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now - activityDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return activityDate.toLocaleDateString()
  }

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading activities...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Track your recent learning activities and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">
            No activities yet. Start learning to see them here!
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity._id || index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-2xl flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {activity.message}
                  </p>

                  {activity.metadata && activity.metadata.courseName && (
                    <p className="text-xs text-gray-600 mt-1">
                      in <span className="font-medium">{activity.metadata.courseName}</span>
                    </p>
                  )}

                  {activity.metadata?.quizScore && (
                    <p className="text-xs text-gray-600 mt-1">
                      Score: <span className="font-medium">{activity.metadata.quizScore}%</span>
                    </p>
                  )}

                  {activity.metadata?.badgeName && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-900 border-0">
                      {activity.metadata.icon} {activity.metadata.badgeName}
                    </Badge>
                  )}
                </div>

                <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
                  {formatTime(activity.createdAt)}
                </span>
              </div>
            ))}

            {hasMore && (
              <Button
                onClick={() => setSkip((prev) => prev + limit)}
                disabled={loading}
                variant="outline"
                className="w-full mt-4"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityFeedComponent
