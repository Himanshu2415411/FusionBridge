"use client"

import { motion } from "framer-motion"
import { CourseCard } from "./course-card"

export function CourseList({ courses }) {
  if (!courses || courses.length === 0) {
    return <div className="text-center py-10 text-[#386641]">No courses available at the moment.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id || course._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
        >
          <CourseCard course={course} />
        </motion.div>
      ))}
    </div>
  )
}
