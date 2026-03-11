"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { DollarSign } from "lucide-react"
import apiService from "@/lib/api"
import EarnOverview from "@/components/modules/earn/earn-overview"
import ProjectBoard from "@/components/modules/earn/project-board"
import ProposalGenerator from "@/components/modules/earn/proposal-generator"
import ContractsPanel from "@/components/modules/earn/contracts-panel"
import EarningsSummary from "@/components/modules/earn/earnings-summary"

export default function EarnPage() {
  const [stats, setStats] = useState({})
  const [projects, setProjects] = useState([])
  const [proposals, setProposals] = useState([])
  const [contracts, setContracts] = useState([])
  const [earnings, setEarnings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboardRes, projectsRes, proposalsRes, contractsRes, earningsRes] =
          await Promise.allSettled([
            apiService.getEarnDashboard(),
            apiService.getProjects({ limit: 10 }),
            apiService.getProposals(),
            apiService.getContracts({ limit: 5 }),
            apiService.getEarnings(),
          ])

        if (dashboardRes.status === "fulfilled") {
          const d = dashboardRes.value?.data || dashboardRes.value || {}
          setStats({
            totalEarnings: d.totalEarnings ?? 0,
            activeProjects: d.activeProjects ?? 0,
            completedProjects: d.completedProjects ?? 0,
            pendingPayments: d.pendingPayments ?? 0,
          })
        }
        if (projectsRes.status === "fulfilled") {
          const d = projectsRes.value?.data
          setProjects(Array.isArray(d) ? d : d?.projects || [])
        }
        if (proposalsRes.status === "fulfilled") {
          const d = proposalsRes.value?.data
          setProposals(Array.isArray(d) ? d : d?.proposals || [])
        }
        if (contractsRes.status === "fulfilled") {
          const d = contractsRes.value?.data
          setContracts(Array.isArray(d) ? d : d?.contracts || [])
        }
        if (earningsRes.status === "fulfilled") {
          setEarnings(earningsRes.value?.data || earningsRes.value || {})
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading freelance dashboard…</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <DollarSign className="h-7 w-7 text-[#386641]" />
          <h1 className="text-2xl font-bold text-foreground">Earn</h1>
        </div>
        <p className="text-muted-foreground">
          Manage freelance projects, proposals, contracts, and track your earnings.
        </p>
      </motion.div>

      <Separator />

      {/* Earnings Overview */}
      <EarnOverview stats={stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Project Board</h2>
            <ProjectBoard projects={projects} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Proposal Generator</h2>
            <ProposalGenerator proposals={proposals} />
          </section>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Contracts</h2>
            <ContractsPanel contracts={contracts} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Earnings Summary</h2>
            <EarningsSummary earnings={earnings} />
          </section>
        </div>
      </div>
    </div>
  )
}
