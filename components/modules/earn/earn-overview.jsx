"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Briefcase, CheckCircle, Clock } from "lucide-react"

const STAT_CARDS = [
  {
    key: "totalEarnings",
    label: "Total Earnings",
    icon: DollarSign,
    format: "currency",
  },
  {
    key: "activeProjects",
    label: "Active Projects",
    icon: Briefcase,
    format: "number",
  },
  {
    key: "completedProjects",
    label: "Completed Projects",
    icon: CheckCircle,
    format: "number",
  },
  {
    key: "pendingPayments",
    label: "Pending Payments",
    icon: Clock,
    format: "currency",
  },
]

export default function EarnOverview({ stats = {} }) {
  const values = {
    totalEarnings: stats.totalEarnings ?? 0,
    activeProjects: stats.activeProjects ?? 0,
    completedProjects: stats.completedProjects ?? 0,
    pendingPayments: stats.pendingPayments ?? 0,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-2xl font-bold text-foreground">
                    {card.format === "currency"
                      ? `$${value.toLocaleString()}`
                      : value}
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
