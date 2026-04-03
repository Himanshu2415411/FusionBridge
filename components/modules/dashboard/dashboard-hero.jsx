"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award } from "lucide-react"

export function DashboardHero({ user }) {
  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#386641] mb-2">
          Welcome back, {user.name || "Student"}!
        </h1>
        <p className="text-gray-500">
          Ready to continue your learning and earning journey?
        </p>
      </div>

      <div className="w-full md:w-1/3 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="text-[#F97A00] w-5 h-5" />
            <span className="font-semibold text-[#386641]">Level {user.level || 1}</span>
          </div>
          <Badge className="bg-[#FED16A] text-[#386641] border-none">
            {user.xp || 0} / {user.nextLevelXp || 1000} XP
          </Badge>
        </div>
        <Progress 
          value={((user.xp || 0) / (user.nextLevelXp || 1000)) * 100} 
          className="h-2.5 bg-[#FFF4A4] [&>div]:bg-[#F97A00]" 
        />
      </div>
    </motion.div>
  )
}
