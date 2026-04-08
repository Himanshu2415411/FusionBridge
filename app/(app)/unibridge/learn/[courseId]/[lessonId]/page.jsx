"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LessonPlayer } from "@/components/modules/unibridge/lesson-player"
import { LessonSidebar } from "@/components/modules/unibridge/lesson-sidebar"

export default function LearnPage({ params }) {
  const routeParams = useParams()
  const paramsFromRoute = params || routeParams || {}
  const { courseId, lessonId } = paramsFromRoute
  const normalizedCourseId = Array.isArray(courseId) ? courseId[0] : courseId
  const normalizedLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!normalizedCourseId || !normalizedLessonId) return

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(
          `http://localhost:5000/api/courses/${normalizedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await res.json()

        console.log("COURSE DATA:", data)

        if (!res.ok) {
          throw new Error(data.message || "Failed to load course")
        }

        const courseData = data.data || data.course || data

        if (!courseData || !courseData.lessons) {
          throw new Error("Invalid course data: lessons not found")
        }

        setCourse(courseData)

        // LESSON MATCHING - Find lesson by _id
        const currentLesson = courseData.lessons.find(
          (l) => l._id === normalizedLessonId
        )

        if (!currentLesson) {
          throw new Error("Lesson not found")
        }

        setLesson(currentLesson)

        const progressRes = await fetch(
          `http://localhost:5000/api/progress/${normalizedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const progressDataRes = await progressRes.json()
        setProgress(progressDataRes.progress || progressDataRes || { completedLessons: [] })
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [normalizedCourseId, normalizedLessonId])

  if (loading) {
    return <div className="text-center py-20 text-[#386641] min-h-screen bg-[#FFF4A4]">Loading lesson...</div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 min-h-screen bg-[#FFF4A4]">{error}</div>
  }

  if (!course || !lesson) {
    return <div className="text-center py-20 text-red-500 min-h-screen bg-[#FFF4A4]">Course or lesson not found.</div>
  }

  const currentLessonIndex = course.lessons.findIndex((l) => l._id === normalizedLessonId)

  const handleLessonComplete = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch('http://localhost:5000/api/progress/lesson-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: normalizedCourseId, lessonId: normalizedLessonId })
      })
      
      // Update local progress state
      setProgress(prev => ({
        ...prev,
        completedLessons: [...(prev?.completedLessons || []), normalizedLessonId]
      }))
      
      // Navigate to next lesson if available, else redirect to completion
      if (currentLessonIndex < course.lessons.length - 1) {
        const nextLesson = course.lessons[currentLessonIndex + 1]
        router.push(`/unibridge/learn/${normalizedCourseId}/${nextLesson._id}`)
      } else {
        router.push(`/unibridge/completed/${normalizedCourseId}`)
      }
    } catch (error) {
      console.error("Failed to mark lesson complete:", error)
    }
  }

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = course.lessons[currentLessonIndex - 1]
      router.push(`/unibridge/learn/${normalizedCourseId}/${prevLesson._id}`)
    }
  }

  const completedCount = progress?.completedLessons?.length || 0
  const totalCount = course.lessons.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-[1400px] mx-auto px-6 py-8 min-h-screen bg-[#FFF4A4]"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[70%] space-y-6">
          <LessonPlayer 
            lesson={lesson} 
            course={course}
            onComplete={handleLessonComplete}
            onPrevious={handlePrevious}
            isFirst={currentLessonIndex === 0}
            isLast={currentLessonIndex === course.lessons.length - 1}
          />
        </div>
        <div className="w-full lg:w-[30%]">
          <LessonSidebar 
            course={course} 
            currentLessonId={normalizedLessonId} 
            progress={progress}
            progressPercent={progressPercent}
          />
        </div>
      </div>
    </motion.main>
  )
}
