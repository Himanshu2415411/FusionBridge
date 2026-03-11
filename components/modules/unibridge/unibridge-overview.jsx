"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react"

const STAT_CARDS = [
  {
    key: "coursesEnrolled",
    label: "Courses Enrolled",
    icon: GraduationCap,
    iconColor: "text-[#386641]",
    iconBg: "bg-[#FED16A]/30",
  },
  {
    key: "lessonsCompleted",
    label: "Lessons Completed",
    icon: BookOpen,
    iconColor: "text-[#386641]",
    iconBg: "bg-[#FED16A]/30",
  },
  {
    key: "skillsAcquired",
    label: "Skills Acquired",
    icon: TrendingUp,
    iconColor: "text-[#386641]",
    iconBg: "bg-[#FED16A]/30",
  },
]

export default function UniBridgeOverview({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {STAT_CARDS.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats[card.key] ?? 0}
                  </p>
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
