"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/lib/api"
import { LoadingPage } from "@/components/ui/loading"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  ArrowRight,
  MessageSquare,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getUserDashboard()
      if (response?.success) {
        setDashboardData(response.data)
        return
      }
    } catch (error) {
      console.error("Dashboard API failed, using fallback")
    }

    // deletd SAFE fallback demo data
    // added real fetch data

  const fetchDashboardData = async () => {
  const response = await apiService.getUserDashboard()
  setDashboardData(response.data)
  setLoading(false)
}

    

    setLoading(false)
  }

  if (loading) {
    return <LoadingPage />
  }

  const stats = dashboardData?.stats || {}

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-[#386641] dark:bg-[#FF9433] text-white dark:text-[#121212] text-lg">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#FFD86B]">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70">
            Here’s a snapshot of your progress
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Courses Enrolled" value={stats.coursesEnrolled} sub={`${stats.coursesCompleted} completed`} icon={BookOpen} />
        <StatCard title="Total Earnings" value={`$${stats.totalEarnings}`} sub={`${stats.projectsCompleted} projects`} icon={DollarSign} />
        <StatCard title="Community Posts" value={stats.communityPosts} sub="This month" icon={MessageSquare} />
        <StatCard title="Skills Learned" value={stats.skillsLearned} sub="New skills" icon={TrendingUp} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Continue Learning
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentCourses?.map((course) => (
                <div key={course._id} className="rounded-lg border p-4">
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Next: {course.nextLesson}
                  </p>
                  <Progress value={course.progress} className="mt-3 h-2" />
                </div>
              ))}
              <Link href="/learn">
                <Button variant="outline" className="w-full">
                  View all courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Recent Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentProjects?.map((project) => (
                <div key={project._id} className="flex justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Client: {project.client.name}
                    </p>
                  </div>
                  <Badge>{project.status}</Badge>
                </div>
              ))}
              <Link href="/earn">
                <Button variant="outline" className="w-full">
                  View all projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData?.upcomingEvents?.map((event) => (
                <div key={event._id} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date} · {event.time}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData?.achievements?.map((a) => (
                <div key={a._id} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">
                    {a.icon} {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

/* Stats card */
function StatCard({ title, value, sub, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#386641] dark:text-[#FF9433]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value || 0}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
