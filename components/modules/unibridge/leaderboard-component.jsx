import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

/**
 * Leaderboard Component - Display user's level, XP, and streaks
 */
export function LeaderboardComponent({ userId }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch user data')

      const data = await response.json()
      setUserData(data.data || data.user)
    } catch (error) {
      console.error('Fetch user data error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading stats...</p>
        </CardContent>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Failed to load stats</p>
        </CardContent>
      </Card>
    )
  }

  const currentXp = userData.xp || 0
  const currentLevel = userData.level || 1
  const xpForCurrentLevel = (currentLevel - 1) * 1000
  const xpForNextLevel = currentLevel * 1000
  const levelProgress = currentXp - xpForCurrentLevel
  const maxLevelProgress = xpForNextLevel - xpForCurrentLevel
  const levelProgressPercent = Math.round((levelProgress / maxLevelProgress) * 100)
  const xpToNextLevel = xpForNextLevel - currentXp

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>Track your learning journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Level</h3>
            <div className="text-4xl font-bold text-purple-600">
              {currentLevel}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>XP Progress</span>
              <span>{currentXp} / {xpForNextLevel} XP</span>
            </div>
            <Progress value={levelProgressPercent} className="h-3" />
            <p className="text-xs text-gray-600">
              {xpToNextLevel} XP to next level
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{currentXp}</p>
            <p className="text-xs text-blue-900 mt-1">Total XP</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {userData.currentStreak || 0}
            </p>
            <p className="text-xs text-green-900 mt-1">Current Streak</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {userData.longestStreak || 0}
            </p>
            <p className="text-xs text-orange-900 mt-1">Longest Streak</p>
          </div>
        </div>

        {/* Badges Summary */}
        {userData.badges && userData.badges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Badges</h4>
            <div className="flex flex-wrap gap-2">
              {userData.badges.slice(0, 5).map((badge, index) => (
                <Badge key={index} className="text-xs">
                  {badge.icon} {badge.name}
                </Badge>
              ))}
              {userData.badges.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{userData.badges.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Level Information */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-purple-900">
            <span className="font-semibold">Level System:</span> Each level requires 1000 XP.
            Complete lessons (10 XP), quizzes (20 XP), and courses (200 XP) to level up!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default LeaderboardComponent
