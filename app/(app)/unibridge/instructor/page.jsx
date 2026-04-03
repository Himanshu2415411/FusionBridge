"use client"

import { CourseBuilder } from "@/components/modules/unibridge/course-builder"

export default function InstructorPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 min-h-screen bg-[#FFF4A4]/20">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold text-[#386641]">Instructor Dashboard</h1>
        <p className="text-lg text-gray-600">Create new courses and manage your curriculum.</p>
      </div>
      
      <CourseBuilder />
    </main>
  )
}
