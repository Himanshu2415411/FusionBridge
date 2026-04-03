"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, PlayCircle } from "lucide-react"
import api from "@/lib/api"

export function LessonPlayer({ lesson, course, onComplete, onPrevious, isFirst, isLast }) {
  const videoRef = useRef(null)
  const [lastSavedTime, setLastSavedTime] = useState(0)

  useEffect(() => {
    // Reset when lesson changes
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }

    const fetchProgress = async () => {
      try {
        if (!course?._id || !lesson?._id) return;
        const res = await api.get(`/progress/${course._id}`)
        if (res.data?.success) {
          // Assuming progress array contains { lessonId, watchedSeconds }
          const p = res.data.progress?.find(p => p.lessonId === lesson._id)
          if (p && videoRef.current) {
            videoRef.current.currentTime = p.watchedSeconds || 0
          }
        }
      } catch (err) {
        console.error("Failed to load progress", err)
      }
    }
    
    fetchProgress()
  }, [lesson?._id, course?._id])

  const handleTimeUpdate = async (e) => {
    const currentTime = e.target.currentTime
    // Throttle save to every 5 seconds
    if (currentTime - lastSavedTime > 5 || currentTime < lastSavedTime - 5) {
      setLastSavedTime(currentTime)
      try {
        if (course?._id && lesson?._id) {
          await api.post("/progress/save-time", {
            courseId: course._id,
            lessonId: lesson._id,
            watchedSeconds: currentTime
          })
        }
      } catch (err) {
        console.error("Failed to save progress", err)
      }
    }
  }

  const handleVideoEnded = async () => {
    try {
      if (course?._id && lesson?._id) {
        await api.post("/progress/lesson-complete", {
          courseId: course._id,
          lessonId: lesson._id
        })
      }
    } catch (err) {
      console.error("Failed to complete lesson", err)
    }
    
    if (!isLast) {
      onComplete()
    }
  }

  if (!lesson) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
        <div className="aspect-video w-full bg-black/5 relative flex items-center justify-center">
          {lesson.videoUrl ? (
            <video
              ref={videoRef}
              key={lesson.videoUrl}
              controls
              preload="metadata"
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
          >
              <source src={lesson.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
          </video>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#386641]/50 space-y-4">
              <PlayCircle className="w-16 h-16 opacity-50" />
              <p>Video not available for this lesson</p>
            </div>
          )}
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
