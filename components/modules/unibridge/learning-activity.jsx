"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, PlayCircle, BookOpen, TrendingUp, GraduationCap } from "lucide-react"

const ACTIVITY_ICON_MAP = {
  lesson_completed: CheckCircle,
  quiz_passed: TrendingUp,
  course_started: PlayCircle,
  course_enrolled: GraduationCap,
  default: BookOpen,
}

const ACTIVITY_COLOR_MAP = {
  lesson_completed: "text-[#386641]",
  quiz_passed: "text-[#F97A00]",
  course_started: "text-[#386641]",
  course_enrolled: "text-[#386641]",
  default: "text-muted-foreground",
}

function formatTimestamp(value) {
  if (!value) return null
  const date = new Date(value)
  if (isNaN(date)) return null
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function LearningActivity({ activities = [] }) {
  const recent = activities.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="bg-white rounded-xl border border-border shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#386641]" />
            Learning Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">Recent learning events</p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FED16A]/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#386641]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Complete lessons to see your progress here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((item, i) => {
                const type = item.type || "default"
                const Icon = ACTIVITY_ICON_MAP[type] || ACTIVITY_ICON_MAP.default
                const color = ACTIVITY_COLOR_MAP[type] || ACTIVITY_COLOR_MAP.default
                const timestamp = formatTimestamp(item.createdAt || item.timestamp)

                return (
                  <motion.div
                    key={item._id || item.id || i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                  >
                    <div className="flex items-start gap-3 py-3">
                      <div className={`mt-0.5 shrink-0 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">
                          {item.description || item.message || item.title}
                        </p>
                        {timestamp && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                    {i < recent.length - 1 && <Separator />}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
