"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Award, Flame, Clock } from "lucide-react"
import apiService from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading"

export default function LearnModule() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [dashboardRes, enrolledRes] = await Promise.all([
        apiService.getUserDashboard(),
        apiService.request("/users/me/enrolled-courses"),
      ])

      if (dashboardRes.success) {
        setDashboard(dashboardRes.data)
      }

      if (enrolledRes.success) {
        setEnrolledCourses(enrolledRes.courses)
      }
    } catch (err) {
      console.error("UniBridge load error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const stats = dashboard?.stats || {}

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold mb-6">🎓 UniBridge</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="XP" value={stats.totalXP} icon={<Award />} />
        <StatCard title="Level" value={stats.level} icon={<Flame />} />
        <StatCard title="Active Courses" value={stats.coursesEnrolled} icon={<BookOpen />} />
        <StatCard title="Learning Hours" value={stats.totalLearningHours} icon={<Clock />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard?.recentCourses?.map(course => (
                <div key={course.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{course.title}</span>
                    <span>{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COURSES */}
        <TabsContent value="courses">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map(course => (
              <Card key={course._id}>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">{course.title}</h3>
                  <Progress
                    value={
                      course.totalLessons === 0
                        ? 0
                        : Math.round(
                            (course.progress / course.totalLessons) * 100
                          )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {course.progress} / {course.totalLessons} lessons
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value ?? 0}</p>
        </div>
        <div className="opacity-60">{icon}</div>
      </CardContent>
    </Card>
  )
}
