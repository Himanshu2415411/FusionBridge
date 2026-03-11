"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase } from "lucide-react"

const DIFFICULTY_STYLES = {
  beginner: "bg-[#FED16A]/30 text-[#386641] border-[#FED16A]",
  intermediate: "bg-[#F97A00]/15 text-[#F97A00] border-[#F97A00]/40",
  advanced: "bg-red-100 text-red-700 border-red-200",
}

export default function ProjectIdeas({ projects = [] }) {
  if (!projects.length) {
    return (
      <Card className="bg-white dark:bg-card rounded-xl border border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 text-[#386641]/40" />
          <p>No project ideas yet. Complete your career profile to generate recommendations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {projects.map((project, i) => (
        <motion.div
          key={project._id || i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="bg-white dark:bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base font-semibold text-foreground">
                  {project.title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`shrink-0 capitalize ${DIFFICULTY_STYLES[project.difficulty] || ""}`}
                >
                  {project.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              {project.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white"
              >
                Start Project
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
