import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Achievements Component - Display user badges and achievements
 */
export function AchievementsComponent() {
  const [stats, setStats] = useState(null)
  const [allBadges, setAllBadges] = useState([])
  const [remainingBadges, setRemainingBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAchievementData()
  }, [])

  const fetchAchievementData = async () => {
    try {
      setLoading(true)

      // Fetch badge stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/badges/user/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      // Fetch all badges
      const allBadgesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/badges`
      )

      // Fetch remaining badges
      const remainingResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/badges/user/remaining`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }

      if (allBadgesResponse.ok) {
        const badgesData = await allBadgesResponse.json()
        setAllBadges(badgesData.data)
      }

      if (remainingResponse.ok) {
        const remData = await remainingResponse.json()
        setRemainingBadges(remData.data.badges)
      }
    } catch (error) {
      console.error('Fetch achievements error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
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
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading achievements...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total XP</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.xp}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Badges</p>
              <p className="text-3xl font-bold text-green-600">{stats?.earned}/{stats?.total}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Badge Completion</span>
              <span className="text-sm text-gray-600">{stats?.completionPercent}%</span>
            </div>
            <Progress value={stats?.completionPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Badges Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Earn badges by completing courses, lessons, and achieving streaks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="earned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earned">Earned ({stats?.earned})</TabsTrigger>
              <TabsTrigger value="remaining">Remaining ({stats?.total - stats?.earned})</TabsTrigger>
            </TabsList>

            {/* Earned Badges */}
            <TabsContent value="earned" className="space-y-4">
              {stats?.recentBadges && stats.recentBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.recentBadges.map((badge, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 hover:shadow-md transition">
                            <span className="text-4xl">{badge.icon}</span>
                            <span className="text-xs font-medium text-center">{badge.name}</span>
                            <span className="text-xs text-gray-600">
                              {new Date(badge.earnedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-8">
                  Start earning badges by completing lessons and courses!
                </p>
              )}
            </TabsContent>

            {/* Remaining Badges */}
            <TabsContent value="remaining" className="space-y-4">
              {remainingBadges && remainingBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {remainingBadges.map((badge, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60"
                    >
                      <span className="text-4xl grayscale">{badge.icon}</span>
                      <span className="text-xs font-medium text-center text-gray-600">{badge.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Locked
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-8">
                  You've unlocked all available badges! 🎉
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AchievementsComponent
