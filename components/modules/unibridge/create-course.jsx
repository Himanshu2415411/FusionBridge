"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, BookOpen } from "lucide-react"
import { courseSchema } from "@/lib/validations"
import { useErrorHandler } from "@/hooks/use-error-handler"

export function CreateCourse({ onCourseCreated }) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { handleError, handleSuccess } = useErrorHandler()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    const validation = courseSchema.safeParse(formData)
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      setErrors(fieldErrors)
      handleError("Please check the form for errors", "CreateCourse.validation")
      return
    }
    
    // Clear errors if validation passed
    setErrors({})
    setLoading(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(validation.data)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create course")
      }
      
      if (!data.success) {
        throw new Error(data?.message || "Failed to create course")
      }
      
      handleSuccess("Course created successfully!")
      onCourseCreated(data.data)
    } catch (err) {
      handleError(err, "CreateCourse.submit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-xl border shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center gap-2 text-[#386641] mb-2">
          <BookOpen className="w-5 h-5 text-[#F97A00]" />
          <CardTitle className="text-2xl">Step 1: Course Details</CardTitle>
        </div>
        <CardDescription>Initial setup for your new course container</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[#386641] font-semibold">Course Title</Label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Complete Guide to React" 
              className="rounded-lg focus-visible:ring-[#F97A00]"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title?.[0]}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#386641] font-semibold">Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="What will students learn?" 
              className="min-h-[100px] rounded-lg focus-visible:ring-[#F97A00]"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description?.[0]}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#386641] font-semibold">Category / Skill Tag</Label>
            <Input 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              placeholder="e.g. Web Development" 
              className="rounded-lg focus-visible:ring-[#F97A00]"
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category?.[0]}</p>
            )}
          </div>
          
          <Button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white rounded-xl py-6 text-lg shadow-sm"
          >
            {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Create Course Container
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
