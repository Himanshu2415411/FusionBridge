"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, CheckCircle2, Circle, Zap, TrendingUp, MapPin } from "lucide-react"

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch("http://localhost:5000/api/grow/roadmap", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        console.log("ROADMAP DATA:", data)

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch roadmap")
        }

        setRoadmap(data.data || data)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center py-20 text-[#386641] min-h-screen bg-[#FFF4A4]/20 rounded-lg flex items-center justify-center">
          <div className="text-lg font-medium">Generating your career roadmap...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center py-20 text-red-500 min-h-[60vh] flex items-center justify-center">
          <div className="space-y-4">
            <p className="text-lg font-medium">{error}</p>
            <Link href="/grow">
              <Button variant="outline">← Back to Grow</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center py-20 text-gray-500 min-h-[60vh] flex items-center justify-center">
          <div className="space-y-4">
            <p className="text-lg font-medium">No roadmap found</p>
            <Link href="/grow">
              <Button variant="outline">← Back to Grow</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = roadmap?.steps || []
  const goal = roadmap?.goal || "Career Growth"
  const timeframe = roadmap?.timeframe || "6-12 months"

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 bg-[#FFF4A4]/10 rounded-lg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-[#386641]" />
          <div>
            <h1 className="text-4xl font-bold text-[#386641]">Career Roadmap</h1>
            <p className="text-gray-600 mt-1">Your personalized path to growth and success</p>
          </div>
        </div>
      </motion.div>

      {/* Goal & Timeframe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="border-[#386641]/20 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#386641]" />
              Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-[#386641]">{goal}</p>
          </CardContent>
        </Card>

        <Card className="border-[#386641]/20 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#386641]" />
              Timeframe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-[#386641]">{timeframe}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Steps Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-[#386641]">Roadmap Steps</h2>

        {steps && steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="relative border-[#386641]/20 hover:border-[#386641]/40 transition-colors bg-white hover:shadow-md">
                  {/* Vertical line connector */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-16 w-0.5 h-20 bg-[#386641]/20" />
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      {/* Step number circle */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#386641] text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-[#386641]">
                              {step.title || step.name || `Step ${index + 1}`}
                            </CardTitle>
                            {step.duration && (
                              <Badge variant="outline" className="mt-2 text-xs border-[#386641]/30 text-[#386641]">
                                {step.duration}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#386641]/40 flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pl-16">
                    <p className="text-gray-700 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Skills or Actions */}
                    {step.skills && step.skills.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-600">Skills to learn:</p>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, skillIdx) => (
                            <Badge
                              key={skillIdx}
                              variant="secondary"
                              className="bg-[#386641]/10 text-[#386641] border-0"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-600">Resources:</p>
                        <ul className="space-y-1">
                          {step.resources.map((resource, resIdx) => (
                            <li key={resIdx} className="text-sm text-gray-600 flex items-start gap-2">
                              <Circle className="h-1.5 w-1.5 mt-1.5 text-[#386641]" />
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Milestones */}
                    {step.milestones && step.milestones.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-600">Milestones:</p>
                        <ul className="space-y-1">
                          {step.milestones.map((milestone, milIdx) => (
                            <li key={milIdx} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-[#386641]" />
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-[#386641]/20 bg-white">
            <CardContent className="text-center py-8 text-gray-500">
              No roadmap steps available. Please try again later.
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap gap-3 justify-center pt-8"
      >
        <Link href="/grow">
          <Button variant="outline" className="border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white">
            ← Back to Grow
          </Button>
        </Link>
        <Link href="/grow/projects">
          <Button
            className="bg-[#386641] hover:bg-[#2d5436] text-white"
          >
            View Projects <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
