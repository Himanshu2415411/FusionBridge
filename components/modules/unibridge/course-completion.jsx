"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CertificateCard } from "./certificate-card"
import { NextSteps } from "./next-steps"

export function CourseCompletion({ course }) {
  const [showCertificate, setShowCertificate] = useState(false)

  if (!course) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="rounded-xl border shadow-lg bg-white overflow-hidden text-center">
        <CardHeader className="bg-[#FED16A]/20 pt-10 pb-6 border-b border-[#FED16A]/30">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-[#FED16A] rounded-full flex items-center justify-center text-[#F97A00] shadow-md">
              <Award className="h-12 w-12" />
            </div>
          </div>
          <Badge className="mx-auto mb-4 bg-[#FFF4A4] text-[#386641] border-[#FED16A] px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Course Completed!
          </Badge>
          <CardTitle className="text-3xl font-bold text-[#386641]">
            Congratulations!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2">
            <p className="text-gray-600 text-lg">You have successfully mastered:</p>
            <p className="text-xl font-semibold text-[#386641]">{course.title}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/unibridge/courses">
              <Button className="w-full sm:w-auto bg-[#F97A00] hover:bg-[#F97A00]/90 text-white rounded-xl">
                Explore More Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              onClick={() => setShowCertificate(true)}
              className="w-full sm:w-auto border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white rounded-xl"
            >
              View Certificate
            </Button>
          </div>

          <AnimatePresence>
            {showCertificate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CertificateCard courseId={course.id || course._id} />
              </motion.div>
            )}
          </AnimatePresence>

          <NextSteps course={course} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
