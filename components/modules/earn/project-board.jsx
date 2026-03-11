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
import { Briefcase, Clock } from "lucide-react"

const STATUS_STYLES = {
  active: "bg-[#386641]/10 text-[#386641] border-[#386641]/30",
  completed: "bg-[#FED16A]/30 text-[#386641] border-[#FED16A]",
  pending: "bg-[#F97A00]/15 text-[#F97A00] border-[#F97A00]/40",
}

export default function ProjectBoard({ projects = [] }) {
  if (!projects.length) {
    return (
      <Card className="bg-white dark:bg-card rounded-xl border border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 text-[#386641]/40" />
          <p>No projects found. Check back later for new opportunities.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {projects.map((project, i) => {
        const status = (project.status || "pending").toLowerCase()

        return (
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
                    className={`shrink-0 capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
                  >
                    {status}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {project.client?.name || project.clientName || "Unknown client"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 mt-auto space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-semibold text-foreground">
                    ${(project.budget ?? 0).toLocaleString()}
                  </span>
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
