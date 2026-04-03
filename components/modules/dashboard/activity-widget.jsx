"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BookOpen, Rocket, DollarSign, Award } from "lucide-react"

export function ActivityWidget({ activities }) {
  const getIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen className="w-4 h-4 text-[#F97A00]" />
      case 'project': return <Rocket className="w-4 h-4 text-blue-500" />
      case 'earn': return <DollarSign className="w-4 h-4 text-green-500" />
      case 'achievement': return <Award className="w-4 h-4 text-[#FED16A]" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getBg = (type) => {
    switch (type) {
      case 'course': return "bg-[#F97A00]/10"
      case 'project': return "bg-blue-500/10"
      case 'earn': return "bg-green-500/10"
      case 'achievement': return "bg-[#FED16A]/20"
      default: return "bg-gray-100"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.4 }}
      className="h-full"
    >
      <Card className="rounded-xl border shadow-sm bg-white border-gray-100 h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#386641]" />
            <CardTitle className="text-lg text-[#386641]">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto max-h-[400px] pr-2 space-y-4">
          
          {activities && activities.length > 0 ? (
            <div className="relative border-l border-gray-200 ml-4 space-y-6 pb-4">
              {activities.map((act, i) => (
                <div key={act.id || i} className="relative pl-6">
                  <div className={`absolute -left-3.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${getBg(act.type)}`}>
                    {getIcon(act.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#386641] leading-tight">{act.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{act.description}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block uppercase font-semibold">
                      {act.time || "Recently"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">No recent activity found.</p>
              <p className="text-xs text-gray-400 mt-1">Start learning or building to see updates here.</p>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  )
}
