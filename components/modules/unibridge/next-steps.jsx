"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, TrendingUp, ArrowRight } from "lucide-react"

export function NextSteps({ course }) {
  const [projects, setProjects] = useState([])
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNextSteps = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = {
          Authorization: `Bearer ${token}`
        }
        const skill = course?.category || "general"
        const [projectsRes, roadmapRes] = await Promise.all([
          fetch(`http://localhost:5000/api/grow/projects?skill=${encodeURIComponent(skill)}`, { headers }),
          fetch(`http://localhost:5000/api/grow/roadmap`, { headers })
        ])
        
        const projectsData = await projectsRes.json().catch(() => ({ projects: [] }))
        const roadmapData = await roadmapRes.json().catch(() => ({ roadmap: null }))

        setProjects(projectsData.projects || projectsData || [])
        setRoadmap(roadmapData.roadmap || roadmapData || null)
      } catch (error) {
        console.error("Failed to fetch next steps:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNextSteps()
  }, [course])

  if (loading) {
    return <div className="text-center py-8 text-[#386641]/70">Loading recommendations...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-12 space-y-6 w-full text-left"
    >
      <h3 className="text-2xl font-bold text-[#386641]">What's Next?</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
        {/* Recommended Projects Section */}
        <Card className="rounded-xl border shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <div className="flex items-center gap-2 text-[#386641]">
              <Rocket className="w-5 h-5 text-[#F97A00]" />
              <CardTitle className="text-lg">Apply Your Skills</CardTitle>
            </div>
            <CardDescription>Suggested projects matching your new skills</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((project, idx) => (
                <div key={project.id || idx} className="p-4 rounded-lg border hover:shadow-md transition bg-gray-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-semibold text-[#386641] text-sm leading-tight">{project.title || "Project"}</h5>
                    <Badge className="bg-[#FFF4A4] text-[#F97A00] text-xs font-medium border-none hover:bg-[#FFF4A4] shrink-0 ml-2">
                      {project.difficulty || "Beginner"}
                    </Badge>
                  </div>
                  <Link href={`/grow/build/${project.id || project._id || ''}`}>
                    <Button size="sm" className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white rounded-lg h-9">
                      Start Project
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-3">No specific projects found for this skill.</p>
                <Link href="/grow/build">
                  <Button variant="outline" size="sm" className="border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white rounded-lg">
                    Browse All Projects
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roadmap Section */}
        {roadmap && (
          <Card className="rounded-xl border shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <div className="flex items-center gap-2 text-[#386641]">
                <TrendingUp className="w-5 h-5 text-[#F97A00]" />
                <CardTitle className="text-lg">Career Roadmap</CardTitle>
              </div>
              <CardDescription>Your progress towards your goal</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Target Role</p>
                <p className="font-bold text-[#386641] text-xl">{roadmap.targetRole || "Software Engineer"}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-end">
                  <span className="font-medium text-gray-700">Roadmap Progress</span>
                  <span className="font-bold text-[#F97A00]">{roadmap.progress || 0}%</span>
                </div>
                <div className="w-full h-3 bg-[#FFF4A4] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F97A00] rounded-full" 
                    style={{ width: `${roadmap.progress || 0}%` }}
                  />
                </div>
              </div>
              
              <Link href="/grow/roadmap" className="block pt-4">
                <Button className="w-full bg-[#386641] hover:bg-[#386641]/90 text-white rounded-xl py-5">
                  View Full Roadmap
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  )
}
