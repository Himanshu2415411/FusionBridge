"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, BookOpen, Loader2 } from "lucide-react"

export function CourseDetail({ course }) {
  const router = useRouter()
  const [isEnrolling, setIsEnrolling] = useState(false)

  if (!course) return null

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true)
      await fetch(`/api/courses/${course.id || course._id}/enroll`, {
        method: 'POST',
      })
      
      const firstLessonId = course.lessons?.[0]?.id || course.lessons?.[0]?._id || 'start'
      router.push(`/unibridge/learn/${course.id || course._id}/${firstLessonId}`)
    } catch (error) {
      console.error("Failed to enroll:", error)
      setIsEnrolling(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      <Card className="rounded-xl border shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-start mb-4">
            <Badge className="bg-[#FED16A] text-[#386641] hover:bg-[#FED16A]/80 text-sm px-3 py-1 border-none">
              {course.category || 'General'}
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold text-[#386641]">{course.title}</CardTitle>
          <CardDescription className="text-base mt-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="bg-[#F97A00] hover:bg-[#F97A00]/90 text-white px-8 py-6 text-lg rounded-xl shadow-md"
          >
            {isEnrolling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {isEnrolling ? "Enrolling..." : "Enroll Now"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-[#386641] flex items-center">
          <BookOpen className="mr-2 h-6 w-6" />
          Lessons
        </h3>

        <div className="grid gap-3">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson, index) => (
              <Card key={lesson.id || index} className="rounded-xl border shadow-sm bg-white hover:bg-gray-50 transition">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-[#FFF4A4] flex items-center justify-center text-[#F97A00]">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#386641]">{lesson.title}</p>
                      <p className="text-sm text-gray-500">{lesson.duration || "10 mins"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-[#386641]/70 italic p-4">No lessons available for this course yet.</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
