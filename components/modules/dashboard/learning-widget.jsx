"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export function LearningWidget({ courses }) {
  if (!courses || courses.length === 0) return null

  const activeCourses = courses.filter(c => (c.progress ?? 0) < 100).slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
    >
      <Card className="rounded-xl border shadow-sm bg-white border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#386641]" />
            <CardTitle className="text-lg text-[#386641]">Continue Learning</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeCourses.length > 0 ? (
            activeCourses.map((course, i) => (
              <div key={course.id || i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[#386641]">{course.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{course.nextLessonTitle || "Next Lesson"}</p>
                  </div>
                  <span className="text-sm font-bold text-[#F97A00]">{course.progress || 0}%</span>
                </div>
                
                <Progress 
                  value={course.progress || 0} 
                  className="h-2 bg-[#386641]/10 [&>div]:bg-[#386641]" 
                />

                <Link href={`/unibridge/learn/${course.id || course._id}/${course.lastLessonId || 'start'}`} className="block pt-2">
                  <Button size="sm" className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white rounded-lg">
                    Resume
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No active courses.</p>
              <Link href="/unibridge/courses">
                <Button variant="outline" className="border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white rounded-lg">
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
