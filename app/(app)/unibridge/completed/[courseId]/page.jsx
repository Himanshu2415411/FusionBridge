"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CourseCompletion } from "@/components/modules/unibridge/course-completion"

export default function CourseCompletedPage() {
  const { courseId } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `http://localhost:5000/api/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const data = await response.json()
        setCourse(data.data || data.course || data)
      } catch (error) {
        console.error("Failed to fetch course details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  if (loading) {
    return <div className="min-h-screen bg-[#FFF4A4] flex items-center justify-center text-[#386641]">Loading...</div>
  }

  if (!course) {
    return <div className="min-h-screen bg-[#FFF4A4] flex items-center justify-center text-red-500">Course not found.</div>
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 min-h-screen bg-[#FFF4A4]">
      <CourseCompletion course={course} />
    </main>
  )
}
