"use client"

import { useEffect, useState } from "react"
import { DashboardHero } from "@/components/modules/dashboard/dashboard-hero"
import { DashboardStats } from "@/components/modules/dashboard/dashboard-stats"
import { LearningWidget } from "@/components/modules/dashboard/learning-widget"
import { GrowWidget } from "@/components/modules/dashboard/grow-widget"
import { EarnWidget } from "@/components/modules/dashboard/earn-widget"
import { ActivityWidget } from "@/components/modules/dashboard/activity-widget"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardPage() {
  const [data, setData] = useState({
    user: null,
    stats: null,
    courses: [],
    roadmap: null,
    growProjects: [],
    earnings: null,
    earnProjects: [],
    activities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, activityRes, earnRes, growRes] = await Promise.all([
          fetch('/api/dashboard/overview').catch(() => ({ json: () => ({}) })),
          fetch('/api/activity').catch(() => ({ json: () => ({}) })),
          fetch('/api/earn/projects').catch(() => ({ json: () => ({}) })),
          fetch('/api/grow/projects').catch(() => ({ json: () => ({}) }))
        ])

        const overview = await overviewRes.json()
        const activity = await activityRes.json()
        const earn = await earnRes.json()
        const grow = await growRes.json()

        setData({
          user: overview.user || { name: "Explorer", level: 1, xp: 0, nextLevelXp: 1000 },
          stats: overview.stats || { coursesCompleted: 0, skillsLearned: 0, activeProjects: 0, totalEarnings: 0 },
          courses: overview.courses || [],
          roadmap: overview.roadmap || null,
          earnings: overview.earnings || { pending: 0, available: 0 },
          activities: activity.activities || activity || [],
          earnProjects: earn.projects || earn || [],
          growProjects: grow.projects || grow || []
        })
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#FFF4A4]/30 flex items-center justify-center text-[#386641] font-medium">Dashboard Loading...</div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FFF4A4]/20 pb-12">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          <DashboardHero user={data.user} />
          <DashboardStats stats={data.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <LearningWidget courses={data.courses} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GrowWidget projects={data.growProjects} roadmap={data.roadmap} />
                <EarnWidget earnings={data.earnings} activeFreelance={data.earnProjects} />
              </div>
            </div>

            <div className="lg:col-span-1 h-full">
              <ActivityWidget activities={data.activities} />
            </div>
          </div>

        </div>
      </main>
    </ProtectedRoute>
  )
}
