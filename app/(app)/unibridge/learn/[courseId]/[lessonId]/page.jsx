"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LessonPlayer } from "@/components/modules/unibridge/lesson-player"
import { LessonSidebar } from "@/components/modules/unibridge/lesson-sidebar"

export default function LearnPage() {
  const { courseId, lessonId } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return

    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/progress/${courseId}`)
        ])

        const courseData = await courseRes.json()
        const progressDataRes = await progressRes.json()

        const actualCourse = courseData.course || courseData
        setCourse(actualCourse)
        setProgress(progressDataRes.progress || progressDataRes || { completedLessons: [] })

        // If 'start' lessonId is provided, redirect to the first actual lesson
        if (lessonId === 'start' && actualCourse?.lessons?.length > 0) {
          router.replace(`/unibridge/learn/${courseId}/${actualCourse.lessons[0].id || actualCourse.lessons[0]._id}`)
        }
      } catch (error) {
        console.error("Failed to fetch learn data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, lessonId, router])

  if (loading) {
    return <div className="text-center py-20 text-[#386641] min-h-screen bg-[#FFF4A4]">Loading lesson...</div>
  }

  if (!course || !course.lessons) {
    return <div className="text-center py-20 text-red-500 min-h-screen bg-[#FFF4A4]">Course or lessons not found.</div>
  }

  const currentLessonIndex = course.lessons.findIndex(l => (l.id || l._id) === lessonId)
  const lesson = course.lessons[currentLessonIndex]

  if (!lesson && lessonId !== 'start') {
    return <div className="text-center py-20 text-red-500 min-h-screen bg-[#FFF4A4]">Lesson not found.</div>
  }

  const handleLessonComplete = async () => {
    try {
      await fetch('/api/progress/lesson-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId })
      })
      
      // Update local progress state
      setProgress(prev => ({
        ...prev,
        completedLessons: [...(prev?.completedLessons || []), lessonId]
      }))
      
      // Navigate to next lesson if available
      if (currentLessonIndex < course.lessons.length - 1) {
        const nextLesson = course.lessons[currentLessonIndex + 1]
        router.push(`/unibridge/learn/${courseId}/${nextLesson.id || nextLesson._id}`)
      }
    } catch (error) {
      console.error("Failed to mark lesson complete:", error)
    }
  }

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = course.lessons[currentLessonIndex - 1]
      router.push(`/unibridge/learn/${courseId}/${prevLesson.id || prevLesson._id}`)
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
            currentLessonId={lessonId} 
            progress={progress}
            progressPercent={progressPercent}
          />
        </div>
      </div>
    </motion.main>
  )
}
