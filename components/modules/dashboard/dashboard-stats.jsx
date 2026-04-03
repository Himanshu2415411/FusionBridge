"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, TrendingUp, Activity, DollarSign } from "lucide-react"

export function DashboardStats({ stats }) {
  if (!stats) return null

  const statItems = [
    {
      title: "Courses Completed",
      value: stats.coursesCompleted || 0,
      icon: <BookOpen className="w-5 h-5 text-[#386641]" />,
      bg: "bg-[#386641]/10"
    },
    {
      title: "Skills Learned",
      value: stats.skillsLearned || 0,
      icon: <TrendingUp className="w-5 h-5 text-[#F97A00]" />,
      bg: "bg-[#F97A00]/10"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects || 0,
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Total Earnings",
      value: `$${stats.totalEarnings || 0}`,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      bg: "bg-green-500/10"
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          whileHover={{ y: -4 }}
        >
          <Card className="rounded-xl border shadow-sm bg-white border-gray-100 h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-full ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-[#386641]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
