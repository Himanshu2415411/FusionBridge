"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText } from "lucide-react"

export default function ResumeAnalyzer({ resume = {} }) {
  const completionPercent = resume.overallScore ?? 0
  const lastUpdated = resume.lastUpdated
    ? new Date(resume.lastUpdated).toLocaleDateString()
    : "Never"

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
              <FileText className="h-5 w-5 text-[#386641]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Resume Analyzer</CardTitle>
              <CardDescription className="text-sm">
                Last updated: {lastUpdated}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Completion</span>
              <span className="text-sm font-semibold text-foreground">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>

          {resume.atsScore != null && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">ATS Compatibility</span>
                <span className="text-sm font-semibold text-foreground">{resume.atsScore}%</span>
              </div>
              <Progress value={resume.atsScore} className="h-2" />
            </div>
          )}

          {(resume.strengths?.length > 0 || resume.improvements?.length > 0) && (
            <>
              <Separator />
              {resume.strengths?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Strengths</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {resume.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resume.improvements?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Improvements</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {resume.improvements.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <Button className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white">
            Improve Resume
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
