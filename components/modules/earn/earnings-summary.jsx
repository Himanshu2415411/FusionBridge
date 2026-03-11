"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

export default function EarningsSummary({ earnings = {} }) {
  const totalRevenue = earnings.totalRevenue ?? 0
  const monthlyRevenue = earnings.monthlyRevenue ?? 0
  const pendingPayments = earnings.pendingPayments ?? 0
  const trend = earnings.trend || []

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
              <TrendingUp className="h-5 w-5 text-[#386641]" />
            </div>
            <CardTitle className="text-base font-semibold">Earnings Summary</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                ${monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                ${pendingPayments.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>

          {trend.length > 0 && (
            <>
              <Separator />
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#386641" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#386641" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#386641"
                      strokeWidth={2}
                      fill="url(#earnFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
