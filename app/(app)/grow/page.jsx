"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Rocket } from "lucide-react"
import apiService from "@/lib/api"
import GrowOverview from "@/components/modules/grow/grow-overview"
import ProjectIdeas from "@/components/modules/grow/project-ideas"
import ResumeAnalyzer from "@/components/modules/grow/resume-analyzer"
import InterviewPrep from "@/components/modules/grow/interview-prep"

export default function GrowPage() {
  const [roadmap, setRoadmap] = useState({})
  const [projects, setProjects] = useState([])
  const [resume, setResume] = useState({})
  const [interview, setInterview] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roadmapRes, projectsRes, resumeRes, interviewRes] =
          await Promise.allSettled([
            apiService.getGrowRoadmap(),
            apiService.getGrowProjects(),
            apiService.getGrowResume(),
            apiService.getGrowInterview(),
          ])

        if (roadmapRes.status === "fulfilled") {
          setRoadmap(roadmapRes.value?.data || roadmapRes.value || {})
        }
        if (projectsRes.status === "fulfilled") {
          const d = projectsRes.value?.data
          setProjects(Array.isArray(d) ? d : d?.projects || [])
        }
        if (resumeRes.status === "fulfilled") {
          setResume(resumeRes.value?.data || resumeRes.value || {})
        }
        if (interviewRes.status === "fulfilled") {
          const d = interviewRes.value?.data
          setInterview({
            questions: Array.isArray(d) ? d : d?.questions || [],
            role: (Array.isArray(d) ? d[0]?.role : d?.role) || "General",
            readinessScore: d?.readinessScore,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading career dashboard…</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Rocket className="h-7 w-7 text-[#386641]" />
          <h1 className="text-2xl font-bold text-foreground">Grow Your Career</h1>
        </div>
        <p className="text-muted-foreground">
          Your career development command center — track progress, build projects, and prepare for interviews.
        </p>
      </motion.div>

      <Separator />

      {/* Career Overview */}
      <GrowOverview roadmap={roadmap} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Project Ideas</h2>
            <ProjectIdeas projects={projects} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Resume Analyzer</h2>
            <ResumeAnalyzer resume={resume} />
          </section>
        </div>

        {/* Right Column (1/3) */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Interview Prep</h2>
          <InterviewPrep interview={interview} />
        </div>
      </div>
    </div>
  )
}
