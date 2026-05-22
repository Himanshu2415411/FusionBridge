'use client'

import { useState } from 'react'
import { useLeaderboard } from '@/hooks/useQueries'
import { LeaderboardSkeleton } from '@/components/skeletons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OptimizedImage, AvatarImage } from '@/components/optimized-image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Star, Flame } from 'lucide-react'
import { ChevronUp, ChevronDown } from 'lucide-react'

/**
 * Global Leaderboard Component with React Query Caching
 * Features:
 * - Multiple leaderboard views (XP, Level, Badges, Streaks)
 * - Pagination support
 * - Current user's rank
 * - Real-time caching with 5-minute stale time
 */
export function GlobalLeaderboard() {
  const [leaderboardType, setLeaderboardType] = useState('xp')
  const [page, setPage] = useState(1)
  const limit = 50

  // Hooks would need to be created for each leaderboard type
  // For now, using basic leaderboard
  const { data, isLoading, error } = useLeaderboard(page, limit)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Failed to load leaderboard</p>
      </div>
    )
  }

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  const leaderboard = data?.leaderboard || []
  const userRank = data?.userRank
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={leaderboardType} onValueChange={setLeaderboardType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="xp" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">XP</span>
          </TabsTrigger>
          <TabsTrigger value="level" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Level</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Streak</span>
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard List */}
        <TabsContent value={leaderboardType} className="space-y-4">
          {/* Current User Rank Card (if authenticated) */}
          {userRank && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-blue-600 w-8 text-center">
                    #{userRank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your Rank</p>
                    <p className="text-sm text-gray-600">
                      You're in the top {Math.round((userRank / 1000) * 100)}%
                    </p>
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          )}

          {/* Leaderboard Entries */}
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <LeaderboardEntry
                key={index}
                entry={entry}
                type={leaderboardType}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page <span className="font-semibold">{page}</span> of{' '}
              <span className="font-semibold">{pagination.totalPages}</span>
            </span>

            <Button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Individual leaderboard entry
 */
function LeaderboardEntry({ entry, type }) {
  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800'
    if (rank === 2) return 'bg-gray-100 text-gray-800'
    if (rank === 3) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-50 text-gray-800'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border ${getRankColor(entry.rank)}`}>
      {/* Rank */}
      <div className="w-10 flex justify-center">
        {getRankIcon(entry.rank) ? (
          <span className="text-xl">{getRankIcon(entry.rank)}</span>
        ) : (
          <span className="font-bold text-lg">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <AvatarImage
          src={entry.avatar}
          alt={entry.name}
          size="md"
        />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
          <p className="text-xs text-gray-600">Level {entry.level}</p>
        </div>
      </div>

      {/* Stats by type */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        {type === 'xp' && (
          <div className="text-right">
            <p className="font-bold text-lg text-blue-600">{entry.xp}</p>
            <p className="text-xs text-gray-600">XP</p>
          </div>
        )}

        {type === 'level' && (
          <div className="text-right">
            <p className="font-bold text-lg text-blue-600">{entry.level}</p>
            <p className="text-xs text-gray-600">Level</p>
          </div>
        )}

        {type === 'badges' && (
          <div className="text-right">
            <p className="font-bold text-lg text-purple-600">{entry.badgesCount}</p>
            <p className="text-xs text-gray-600">Badges</p>
          </div>
        )}

        {type === 'streak' && (
          <div className="text-right">
            <p className="font-bold text-lg text-red-600">{entry.currentStreak}</p>
            <p className="text-xs text-gray-600">Days</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact leaderboard widget for dashboard
 */
export function LeaderboardWidget({ limit = 5 }) {
  const { data, isLoading } = useLeaderboard(1, limit)

  if (isLoading) {
    return <LeaderboardSkeleton count={limit} />
  }

  const leaderboard = data?.leaderboard || []

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">Top Learners</h3>
        <Trophy className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="space-y-3">
        {leaderboard.slice(0, limit).map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-bold text-gray-400 w-6 text-center">
                #{entry.rank}
              </span>
              <AvatarImage
                src={entry.avatar}
                alt={entry.name}
                size="sm"
              />
              <span className="text-sm font-medium truncate">{entry.name}</span>
            </div>
            <Badge variant="outline" className="ml-2">
              {entry.xp} XP
            </Badge>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" size="sm">
        View Full Leaderboard
      </Button>
    </div>
  )
}
