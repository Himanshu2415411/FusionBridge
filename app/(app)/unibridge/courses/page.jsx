"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CourseList } from "@/components/modules/unibridge/course-list"

export default function CourseExplorerPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses", {
        credentials: "include",
      })

      const result = await response.json()

      setCourses(result.data || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }

  fetchCourses()
}, [])


  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-[#FFF4A4] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-[#386641]">Course Explorer</h1>
        <p className="text-lg text-[#386641]/80">Browse all available courses</p>
      </motion.div>

      {loading ? (
        <div className="py-10 text-center text-[#386641]">Loading courses...</div>
      ) : (
        <CourseList courses={courses} />
      )}
    </main>
  )
}
