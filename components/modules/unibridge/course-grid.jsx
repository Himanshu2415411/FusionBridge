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
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function CourseGrid({ courses = [], onEnroll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#386641]" />
          Course Explorer
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Browse all available courses
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full py-10 text-center">
            No courses available at the moment.
          </p>
        ) : (
          courses.map((course, i) => (
            <motion.div
              key={course._id || course.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold text-foreground leading-snug">
                      {course.title}
                    </CardTitle>
                    {course.category && (
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0 border-[#FED16A] text-[#386641] bg-[#FED16A]/20"
                      >
                        {course.category}
                      </Badge>
                    )}
                  </div>
                  {course.description && (
                    <CardDescription className="text-xs line-clamp-2 mt-2">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-6 pt-0 mt-auto">
                  <Button
                    size="sm"
                    className="w-full bg-[#F97A00] hover:bg-[#e06900] text-white text-xs"
                    onClick={() => onEnroll?.(course._id || course.id)}
                  >
                    Enroll
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
