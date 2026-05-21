"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { getCourseId } from "@/lib/id-utils"

export function CourseCard({ course }) {
  const courseId = getCourseId(course)
  
  return (
    <motion.div whileHover={{ y: -6 }} className="h-full">
      <Card className="rounded-xl border shadow-sm hover:shadow-lg transition bg-white h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge className="bg-[#FED16A] text-[#386641] hover:bg-[#FED16A]/80 border-none">
              {course.category || 'General'}
            </Badge>
            <div className="flex items-center text-sm text-[#386641]/70">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>{course.lessonsCount || 0} lessons</span>
            </div>
          </div>
          <CardTitle className="text-xl text-[#386641]">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-4">
          <Link href={`/unibridge/courses/${courseId || '#'}`} className="block">
            <Button className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white font-medium rounded-xl">
              View Course
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
