"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, CheckCircle, Video, PlayCircle } from "lucide-react"
import { lessonSchema } from "@/lib/validations"
import { useErrorHandler } from "@/hooks/use-error-handler"

export function AddLessons({ course, onCoursePublished }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [errors, setErrors] = useState({})
  const { handleError, handleSuccess } = useErrorHandler()
  const [formData, setFormData] = useState({ title: "", videoUrl: "", duration: "" })

  const handleAddLesson = async (e) => {
    e.preventDefault()
    
    // Validate
    const lessonData = {
      ...formData,
      duration: parseInt(formData.duration) || 0,
    }
    
    const validation = lessonSchema.safeParse(lessonData)
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      setErrors(fieldErrors)
      handleError("Please check the form for errors", "AddLessons.validation")
      return
    }
    
    setErrors({})
    setLoading(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const courseId = course.id || course._id
      const res = await fetch(`${apiUrl}/courses/${courseId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(validation.data)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.message || "Failed to add lesson")
      }
      
      if (!data.success) {
        throw new Error(data?.message || "Failed to add lesson")
      }
      
      const newLesson = data.data
      setLessons([...lessons, newLesson])
      setFormData({ title: "", videoUrl: "", duration: "" })
      handleSuccess("Lesson added successfully!")
    } catch (err) {
      handleError(err, "AddLessons.addLesson")
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const courseId = course.id || course._id
      const res = await fetch(`${apiUrl}/courses/${courseId}/publish`, {
        method: "PATCH",
        credentials: "include",
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.message || "Failed to publish course")
      }
      
      handleSuccess("Course published successfully!")
      onCoursePublished()
    } catch (err) {
      handleError(err, "AddLessons.publish")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-xl border shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#386641] flex items-center gap-2">
                <Video className="w-5 h-5 text-[#F97A00]" />
                Step 2: Add Curriculum
              </CardTitle>
              <CardDescription className="mt-1">
                Adding modules to: <span className="font-semibold text-[#F97A00]">{course.title}</span>
              </CardDescription>
            </div>
            <div className="bg-[#FFF4A4]/50 px-3 py-1.5 rounded-lg border border-[#FED16A]/50 text-sm font-medium text-[#386641]">
              {lessons.length} Modules Added
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddLesson} className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#386641] font-semibold">Lesson Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Introduction to Variables" 
                  className="bg-white focus-visible:ring-[#F97A00]"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title?.[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[#386641] font-semibold">Duration (minutes)</Label>
                <Input 
                  type="number"
                  value={formData.duration} 
                  onChange={e => setFormData({...formData, duration: e.target.value})} 
                  placeholder="e.g. 15" 
                  className="bg-white focus-visible:ring-[#F97A00]"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration?.[0]}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#386641] font-semibold">Video URL</Label>
              <Input 
                value={formData.videoUrl} 
                onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                placeholder="https://example.com/video.mp4" 
                className="bg-white focus-visible:ring-[#F97A00]"
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-500">{errors.videoUrl?.[0]}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
              {loading ? "Adding..." : "Add Lesson"}
            </Button>
          </form>

          {/* Lessons List */}
          {lessons.length > 0 && (
            <div className="mt-8 space-y-3">
              <h4 className="text-lg font-semibold text-[#386641]">Added Lessons</h4>
              {lessons.map((lesson, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#386641]">{lesson.title}</p>
                    <p className="text-sm text-gray-600">{lesson.duration} minutes</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Publish Button */}
          {lessons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Button 
                onClick={handlePublish}
                disabled={publishing}
                className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white rounded-xl py-6 text-lg"
              >
                {publishing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
                {publishing ? "Publishing..." : "Publish Course"}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

  return (
    <div className="space-y-8">
      <Card className="rounded-xl border shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#386641] flex items-center gap-2">
                <Video className="w-5 h-5 text-[#F97A00]" />
                Step 2: Add Curriculum
              </CardTitle>
              <CardDescription className="mt-1">
                Adding modules to: <span className="font-semibold text-[#F97A00]">{course.title}</span>
              </CardDescription>
            </div>
            <div className="bg-[#FFF4A4]/50 px-3 py-1.5 rounded-lg border border-[#FED16A]/50 text-sm font-medium text-[#386641]">
              {lessons.length} Modules Added
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddLesson} className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#386641] font-semibold">Lesson Title</Label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Introduction to Variables" 
                  className="bg-white focus-visible:ring-[#F97A00]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#386641] font-semibold">Duration</Label>
                <Input 
                  required 
                  value={formData.duration} 
                  onChange={e => setFormData({...formData, duration: e.target.value})} 
                  placeholder="e.g. 10 mins" 
                  className="bg-white focus-visible:ring-[#F97A00]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#386641] font-semibold">Video URL (YouTube)</Label>
              <Input 
                required 
                type="url" 
                value={formData.videoUrl} 
                onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                placeholder="https://youtube.com/embed/..." 
                className="bg-white focus-visible:ring-[#F97A00]"
              />
            </div>
            <Button 
              disabled={loading} 
              type="submit" 
              variant="outline" 
              className="w-full border-2 border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white rounded-xl py-5"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
              Add Lesson Module
            </Button>
          </form>

          {lessons.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mt-8 space-y-3"
            >
              <h4 className="font-semibold text-[#386641] text-lg">Curriculum Overview</h4>
              <div className="grid gap-3">
                {lessons.map((l, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#FFF4A4] flex items-center justify-center text-[#F97A00]">
                        <PlayCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-[#386641] block">Lesson {i + 1}: {l.title}</span>
                        <span className="text-xs text-gray-500">{l.videoUrl}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{l.duration}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {lessons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-xl border-2 border-[#FED16A] shadow-md bg-white">
            <CardHeader className="bg-[#FFF4A4]/30 pb-4 border-b border-[#FED16A]/30">
              <CardTitle className="text-xl text-[#386641]">Step 3: Finalize</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-gray-600">Your course has {lessons.length} lessons and is ready to go live.</p>
              <Button 
                disabled={publishing} 
                onClick={handlePublish} 
                className="w-full bg-[#386641] hover:bg-[#386641]/90 text-white rounded-xl py-6 text-lg"
              >
                {publishing && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                Publish Course Worldwide
                {!publishing && <CheckCircle className="w-5 h-5 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
