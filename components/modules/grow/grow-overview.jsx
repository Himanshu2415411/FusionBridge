"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Briefcase, Rocket } from "lucide-react"

const STAT_CARDS = [
  {
    key: "targetRole",
    label: "Target Role",
    icon: Rocket,
    type: "text",
  },
  {
    key: "roadmapProgress",
    label: "Roadmap Progress",
    icon: TrendingUp,
    type: "progress",
  },
  {
    key: "projectsCompleted",
    label: "Projects Completed",
    icon: Briefcase,
    type: "number",
  },
]

export default function GrowOverview({ roadmap = {} }) {
  const targetRole = roadmap.role || "Not set"
  const requiredSkills = roadmap.requiredSkills || []
  const knownSkills = roadmap.knownSkills || []
  const completedCourses = roadmap.completedCourses || []
  const totalRequired = requiredSkills.length
  const missingCount = (roadmap.missingSkills || []).length
  const progress = totalRequired > 0 ? Math.round(((totalRequired - missingCount) / totalRequired) * 100) : 0

  const values = {
    targetRole,
    roadmapProgress: progress,
    projectsCompleted: (knownSkills.length + completedCourses.length),
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {STAT_CARDS.map((card, i) => {
        const Icon = card.icon
        const value = values[card.key]

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white dark:bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-[#FED16A]/30">
                  <Icon className="h-5 w-5 text-[#386641]" />
                </div>
                <div className="flex-1 min-w-0">
                  {card.type === "progress" ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{value}%</p>
                      <Progress value={value} className="h-2 mt-1" />
                    </>
                  ) : card.type === "text" ? (
                    <p className="text-lg font-bold text-foreground truncate">{value}</p>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
