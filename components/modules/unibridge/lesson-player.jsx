"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function LessonPlayer({ lesson, course, onComplete, onPrevious, isFirst, isLast }) {
  const videoRef = useRef(null)

  useEffect(() => {
    // Reset when lesson changes
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [lesson?._id, course?._id])

  const handleVideoEnded = async () => {
    onComplete()
  }

  if (!lesson || !lesson.videoUrl) {
    return <div>No video available</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
        <div className="aspect-video w-full bg-black/5 relative flex items-center justify-center">
          <video
            ref={videoRef}
            key={lesson.videoUrl}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
            onEnded={handleVideoEnded}
          >
            <source src={lesson.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#386641]">{lesson.title}</h1>
            <p className="text-gray-600 mt-2">{lesson.description || course?.title}</p>
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={onPrevious} 
              disabled={isFirst}
              className="border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Lesson
            </Button>
            
            <Button 
              onClick={() => onComplete()}
              className="bg-[#F97A00] hover:bg-[#F97A00]/90 text-white"
            >
              {isLast ? "Finish Course" : "Next Lesson"}
              {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
