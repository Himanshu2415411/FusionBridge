"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export function GrowWidget({ projects, roadmap }) {
  const suggestedProjects = projects?.slice(0, 2) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 }}
    >
      <Card className="rounded-xl border shadow-sm bg-white border-gray-100 flex flex-col h-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F97A00]" />
              <CardTitle className="text-lg text-[#386641]">Grow & Build</CardTitle>
            </div>
            <Link href="/grow" className="text-sm font-medium text-[#F97A00] hover:underline">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col">
          
          {roadmap && (
            <div className="bg-[#FFF4A4]/50 rounded-xl p-4 border border-[#FED16A]/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-[#386641]">{roadmap.targetRole || "Career Goal"}</span>
                <span className="font-bold text-[#F97A00]">{roadmap.progress || 0}%</span>
              </div>
              <Progress 
                value={roadmap.progress || 0} 
                className="h-2 bg-white [&>div]:bg-[#F97A00]" 
              />
            </div>
          )}

          <div className="space-y-3 flex-1">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Suggested Projects</h4>
            {suggestedProjects.length > 0 ? (
              suggestedProjects.map((project, i) => (
                <div key={project.id || i} className="p-3 border rounded-lg hover:shadow-sm transition bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-[#386641] text-sm">{project.title}</h5>
                    <Badge variant="outline" className="text-xs bg-white">
                      {project.difficulty}
                    </Badge>
                  </div>
                  <Link href={`/grow/build/${project.id || project._id}`}>
                    <Button variant="ghost" size="sm" className="w-full text-[#F97A00] hover:text-[#F97A00] hover:bg-[#FFF4A4] h-8 text-xs font-semibold">
                      Start Building <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Complete courses to unlock projects.</p>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
