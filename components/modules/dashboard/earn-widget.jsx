"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"

export function EarnWidget({ earnings, activeFreelance }) {
  const activeGigs = activeFreelance?.slice(0, 2) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.3 }}
    >
      <Card className="rounded-xl border shadow-sm bg-white border-gray-100 flex flex-col h-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg text-[#386641]">Earn</CardTitle>
            </div>
            <Link href="/earn" className="text-sm font-medium text-[#F97A00] hover:underline">
              Job Board
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col">
          
          <div className="flex p-4 rounded-xl border border-gray-100 bg-gray-50/50 justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Payouts</p>
              <p className="text-2xl font-bold text-[#386641]">${earnings?.pending || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-600">${earnings?.available || 0}</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Freelance</h4>
            {activeGigs.length > 0 ? (
              activeGigs.map((gig, i) => (
                <div key={gig.id || i} className="p-3 border rounded-lg hover:shadow-sm transition bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-[#386641] text-sm">{gig.title}</h5>
                    <span className="text-sm font-bold text-green-600">${gig.budget}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Badge variant="secondary" className="text-[10px] bg-gray-100">
                      {gig.status || "In Progress"}
                    </Badge>
                    <Link href={`/earn/projects/${gig.id || gig._id}`}>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 hover:text-[#F97A00]">
                        Manage <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 mb-2">No active freelance projects.</p>
                <Link href="/earn">
                  <Button size="sm" className="bg-[#386641] hover:bg-[#386641]/90 text-white rounded-lg text-xs h-8">
                    Find Gigs
                  </Button>
                </Link>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
