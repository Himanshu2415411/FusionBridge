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
import { Separator } from "@/components/ui/separator"
import { Brain } from "lucide-react"

export default function InterviewPrep({ interview = {} }) {
  const questions = interview.questions || []
  const role = interview.role || "General"

  const total = questions.length
  const readinessScore = interview.readinessScore ?? (total > 0 ? total * 10 : 0)

  const topicCounts = {}
  questions.forEach((q) => {
    const t = q.type || "general"
    topicCounts[t] = (topicCounts[t] || 0) + 1
  })
  const recommendedTopics = Object.keys(topicCounts)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="bg-white dark:bg-card rounded-xl border border-border shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-[#FED16A]/30">
              <Brain className="h-5 w-5 text-[#386641]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Interview Prep</CardTitle>
              <CardDescription className="text-sm">
                {role} — {total} questions ready
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{readinessScore}</span>
            <span className="text-sm text-muted-foreground">readiness score</span>
          </div>

          {recommendedTopics.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Recommended Topics</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="capitalize bg-[#FED16A]/20 text-[#386641] border-[#FED16A]"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white">
            Start Practice
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
