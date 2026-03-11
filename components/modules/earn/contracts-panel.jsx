"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText } from "lucide-react"

const STATUS_STYLES = {
  active: "bg-[#386641]/10 text-[#386641] border-[#386641]/30",
  completed: "bg-[#FED16A]/30 text-[#386641] border-[#FED16A]",
  pending: "bg-[#F97A00]/15 text-[#F97A00] border-[#F97A00]/40",
  expired: "bg-red-100 text-red-700 border-red-200",
}

export default function ContractsPanel({ contracts = [] }) {
  const displayContracts = contracts.slice(0, 5)

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
            <CardTitle className="text-base font-semibold">Contracts</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-3">
          {displayContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No contracts yet.
            </p>
          ) : (
            displayContracts.map((contract, i) => {
              const status = (contract.status || "pending").toLowerCase()

              return (
                <div key={contract._id || i}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {contract.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`shrink-0 capitalize text-xs ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{contract.client?.name || contract.clientName || "Unknown"}</span>
                      <span className="font-semibold text-foreground">
                        ${(contract.value ?? contract.amount ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
