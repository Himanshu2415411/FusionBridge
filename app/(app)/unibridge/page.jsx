"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"
import apiService from "@/lib/api"
import { LoadingPage } from "@/components/ui/loading"
import UniBridgeOverview from "@/components/modules/unibridge/unibridge-overview"
import ContinueLearning from "@/components/modules/unibridge/continue-learning"
import CourseGrid from "@/components/modules/unibridge/course-grid"
import LearningActivity from "@/components/modules/unibridge/learning-activity"
import { useErrorHandler } from "@/hooks/use-error-handler"

export default function UniBridgePage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [progressCourses, setProgressCourses] = useState([])
  const [courses, setCourses] = useState([])
  const [activities, setActivities] = useState([])
  const { handleError } = useErrorHandler()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [progressRes, coursesRes, activityRes] = await Promise.all([
        apiService.request("/progress").catch(() => null),
        apiService.request("/courses").catch(() => null),
        apiService.request("/activity").catch(() => null),
      ])

      if (progressRes?.stats) setStats(progressRes.stats)
      if (progressRes?.courses) setProgressCourses(progressRes.courses)

      if (Array.isArray(coursesRes)) setCourses(coursesRes)
      else if (coursesRes?.courses) setCourses(coursesRes.courses)
      else if (coursesRes) setCourses(Array.isArray(coursesRes) ? coursesRes : [])

      if (Array.isArray(activityRes)) setActivities(activityRes)
      else if (activityRes?.activities) setActivities(activityRes.activities)
      else if (activityRes) setActivities(Array.isArray(activityRes) ? activityRes : [])
    } catch (err) {
      handleError(err, "UniBridgePage.fetchAll")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      await apiService.enrollInCourse(courseId)
      fetchAll()
    } catch (err) {
      handleError(err, "UniBridgePage.handleEnroll")
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-[#FED16A]/30 flex items-center justify-center shrink-0">
          <GraduationCap className="h-6 w-6 text-[#386641]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">UniBridge</h1>
          <p className="text-sm text-muted-foreground">
            Your learning command center
          </p>
        </div>
      </motion.div>

      {/* Section 1 — Learning Overview */}
      <UniBridgeOverview stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Continue Learning + Course Explorer */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 2 — Continue Learning */}
          <ContinueLearning courses={progressCourses} />

          {/* Section 3 — Course Explorer */}
          <CourseGrid courses={courses} onEnroll={handleEnroll} />
        </div>

        {/* Right — Learning Activity Feed */}
        <div>
          <LearningActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}

