"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, PlayCircle } from "lucide-react"

export function LessonSidebar({ course, currentLessonId, progress, progressPercent }) {
  if (!course || !course.lessons) return null

  const completedLessons = progress?.completedLessons || []
  const completedLessonsCount = progress?.completedLessonsCount ?? completedLessons.length
  const effectiveProgressPercent = progress?.progressPercent ?? progressPercent ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="sticky top-6"
    >
      <Card className="rounded-xl border shadow-sm bg-white">
        <CardHeader className="border-b bg-gray-50/50 rounded-t-xl">
          <CardTitle className="text-lg font-bold text-[#386641]">Course Progress</CardTitle>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-[#386641]/70">
              <span>{completedLessonsCount} of {course.lessons.length} completed</span>
              <span>{Math.round(effectiveProgressPercent)}%</span>
            </div>
            <Progress 
              value={effectiveProgressPercent} 
              className="h-2 bg-[#FFF4A4] [&>div]:bg-[#F97A00]" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            {course.lessons.map((lesson, index) => {
              const lessonId = lesson.id || lesson._id
              const isActive = lessonId === currentLessonId
              const isCompleted = completedLessons.includes(lessonId)

              return (
                <Link key={lessonId} href={`/unibridge/learn/${course.id || course._id}/${lessonId}`}>
                  <div className={`p-4 border-b last:border-0 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 ${
                    isActive ? 'bg-[#FFF4A4]/30 border-l-4 border-l-[#F97A00]' : ''
                  }`}>
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[#386641]" />
                      ) : isActive ? (
                        <PlayCircle className="w-5 h-5 text-[#F97A00]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isActive ? 'text-[#F97A00]' : 'text-[#386641]'}`}>
                        {index + 1}. {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{lesson.duration || "10 mins"}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
