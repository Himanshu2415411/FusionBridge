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
import { FileText } from "lucide-react"

export default function ProposalGenerator({ proposals = [] }) {
  if (!proposals.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="bg-white dark:bg-card rounded-xl border border-border">
          <CardContent className="p-6 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 text-[#386641]/40" />
            <p>No proposal templates available yet.</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {proposals.map((proposal, i) => (
        <motion.div
          key={proposal._id || i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="bg-white dark:bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-[#FED16A]/30">
                  <FileText className="h-5 w-5 text-[#386641]" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold">
                    {proposal.templateName || proposal.title || "Proposal Template"}
                  </CardTitle>
                  {proposal.category && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs border-[#FED16A] text-[#386641] bg-[#FED16A]/20"
                    >
                      {proposal.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              {proposal.description && (
                <CardDescription className="text-sm text-muted-foreground">
                  {proposal.description}
                </CardDescription>
              )}

              {proposal.estimatedBudget != null && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Budget</span>
                    <span className="font-semibold text-foreground">
                      ${(proposal.estimatedBudget ?? 0).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <Button className="w-full bg-[#F97A00] hover:bg-[#F97A00]/90 text-white">
                Generate Proposal
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
