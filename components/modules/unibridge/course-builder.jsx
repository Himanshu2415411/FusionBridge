"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreateCourse } from "./create-course"
import { AddLessons } from "./add-lessons"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function CourseBuilder() {
  const [course, setCourse] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePublished = () => {
    setCourse(null)
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 5000)
  }

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-[#FFF4A4] border border-[#FED16A] text-[#386641] rounded-xl font-medium shadow-sm flex items-center gap-3"
          >
            <div className="bg-[#FED16A] p-1.5 rounded-full text-[#F97A00]">
              <PlusCircle className="w-5 h-5" />
            </div>
            Course successfully published to UniBridge!
          </motion.div>
        )}

        {!course ? (
          <motion.div
            key="create-course"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CreateCourse onCourseCreated={setCourse} />
          </motion.div>
        ) : (
          <motion.div
            key="add-lessons"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <AddLessons course={course} onCoursePublished={handlePublished} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
