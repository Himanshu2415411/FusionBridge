"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CourseDetail } from "@/components/modules/unibridge/course-detail"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return

    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`)
        const data = await response.json()
        setCourse(data.course || data)
      } catch (error) {
        console.error("Failed to fetch course details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetail()
  }, [courseId])

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 bg-[#FFF4A4] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8"
      >
        <Link href="/unibridge/courses">
          <Button variant="outline" className="border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white">
            ← Back to Courses
          </Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="py-20 text-center text-[#386641]">Loading course details...</div>
      ) : !course ? (
        <div className="py-20 text-center text-red-500">Course not found</div>
      ) : (
        <CourseDetail course={course} />
      )}
    </main>
  )
}
