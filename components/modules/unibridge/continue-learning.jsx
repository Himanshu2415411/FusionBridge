"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PlayCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import { getCourseId, getLessonId } from "@/lib/id-utils"

export default function ContinueLearning({ courses = [] }) {
  const activeCourses = courses.filter(c => (c.progress ?? 0) < 100).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-[#386641]" />
            Continue Learning
          </CardTitle>
          <CardDescription>Pick up where you left off</CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          {activeCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FED16A]/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-[#386641]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No courses in progress</p>
                <p className="text-xs text-muted-foreground mt-0.5">Enroll in a course to start learning</p>
              </div>
              <Link href="/unibridge/courses">
                <Button
                  size="sm"
                  className="bg-[#F97A00] hover:bg-[#e06900] text-white text-xs mt-1"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            activeCourses.map((course, i) => {
              const courseId = getCourseId(course)
              const lastLessonId = getLessonId(course.lastAccessedLesson) || course.lessons?.[0]?._id
              
              return (
                <motion.div
                  key={courseId || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {course.title}
                      </h4>
                      {course.category && (
                        <Badge
                          variant="outline"
                          className="text-xs border-[#FED16A] text-[#386641] bg-[#FED16A]/20"
                        >
                          {course.category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {course.progress ?? 0}%
                    </span>
                  </div>

                  <Progress
                    value={course.progress ?? 0}
                    className="h-1.5 bg-[#386641]/10 [&>div]:bg-[#386641]"
                  />

                  {courseId && lastLessonId ? (
                    <Link href={`/unibridge/learn/${courseId}/${lastLessonId}`}>
                      <Button
                        size="sm"
                        className="bg-[#F97A00] hover:bg-[#e06900] text-white text-xs mt-1"
                      >
                        <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                        Continue
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      className="bg-[#F97A00]/50 text-white text-xs mt-1"
                    >
                      No lesson available
                    </Button>
                  )}
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
