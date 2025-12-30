"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  FileText,
  Users,
  Copy,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Star,
  Calendar,
  TrendingUp,
  Zap,
  Send,
  Eye,
  Target,
  Briefcase,
  CreditCard,
  Timer,
  ChevronRight,
  Lightbulb,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../lib/api"
import { LoadingSpinner } from "./ui/loading"

export default function EarnModule() {
  const { user } = useAuth()
  const [jobDescription, setJobDescription] = useState("")
  const [generatedProposal, setGeneratedProposal] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [estimatedBudget, setEstimatedBudget] = useState("")
  const [contractPreview, setContractPreview] = useState("")
  const [selectedTimeUnit, setSelectedTimeUnit] = useState("days")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real data states
  const [projects, setProjects] = useState([])
  const [freelancerStats, setFreelancerStats] = useState({})
  const [clientHistory, setClientHistory] = useState([])
  const [contracts, setContracts] = useState([])
  const [dashboardData, setDashboardData] = useState(null)

  // Task states
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: [],
  })

  useEffect(() => {
    fetchEarnData()
  }, [])

  const fetchEarnData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all earn-related data
      const [projectsResponse, dashboardResponse, contractsResponse] = await Promise.all([
        apiService.getProjects({ limit: 10 }),
        apiService.getEarnDashboard(),
        apiService.getContracts({ limit: 5 }),
      ])

      if (projectsResponse.success) {
        setProjects(projectsResponse.data.projects || [])

        // Organize projects into task categories
        const projectTasks = projectsResponse.data.projects || []
        setTasks({
          todo: projectTasks.filter((p) => p.status === "pending" || p.status === "open"),
          inProgress: projectTasks.filter((p) => p.status === "in_progress" || p.status === "active"),
          completed: projectTasks.filter((p) => p.status === "completed"),
        })
      }

      if (dashboardResponse.success) {
        const dashboard = dashboardResponse.data
        setFreelancerStats({
          totalEarnings: dashboard.totalEarnings || 0,
          monthlyEarnings: dashboard.monthlyEarnings || 0,
          activeProjects: dashboard.activeProjects || 0,
          completedProjects: dashboard.completedProjects || 0,
          averageRating: dashboard.averageRating || 0,
          totalReviews: dashboard.totalReviews || 0,
          responseTime: dashboard.responseTime || "N/A",
          completionRate: dashboard.completionRate || 0,
        })
        setClientHistory(dashboard.clients || [])
        setDashboardData(dashboard)
      }

      if (contractsResponse.success) {
        setContracts(contractsResponse.data.contracts || [])
      }
    } catch (err) {
      console.error("Error fetching earn data:", err)
      setError(err.message)

      // Fallback to demo data if API fails
      setFreelancerStats({
        totalEarnings: 15750,
        monthlyEarnings: 3200,
        activeProjects: 4,
        completedProjects: 23,
        averageRating: 4.8,
        totalReviews: 47,
        responseTime: "2 hours",
        completionRate: 98,
      })

      setTasks({
        todo: [
          {
            _id: 1,
            title: "E-commerce Website Design",
            client: { name: "TechStart Inc." },
            deadline: "2024-03-15",
            budget: 2500,
            priority: "High",
            description: "Complete redesign of e-commerce platform with modern UI/UX",
          },
        ],
        inProgress: [
          {
            _id: 3,
            title: "Logo Design & Branding",
            client: { name: "Creative Agency" },
            deadline: "2024-02-28",
            budget: 800,
            priority: "High",
            description: "Complete brand identity package including logo and guidelines",
          },
        ],
        completed: [
          {
            _id: 5,
            title: "Social Media Graphics",
            client: { name: "Marketing Pro" },
            deadline: "2024-02-15",
            budget: 600,
            priority: "Medium",
            description: "Instagram and Facebook post templates",
          },
        ],
      })

      setClientHistory([
        {
          _id: 1,
          name: "TechStart Inc.",
          email: "contact@techstart.com",
          totalPaid: 5200,
          projects: 3,
          rating: 5,
          lastProject: "2024-02-10",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProposal = async () => {
    if (jobDescription.trim()) {
      try {
        setLoading(true)
        const response = await apiService.generateProposal({
          jobDescription: jobDescription.trim(),
        })

        if (response.success) {
          setGeneratedProposal(response.data.proposal)
        } else {
          throw new Error(response.message || "Failed to generate proposal")
        }
      } catch (err) {
        console.error("Error generating proposal:", err)
        // Fallback to demo proposal
        setGeneratedProposal(`Dear Hiring Manager,

I am excited to submit my proposal for your project. After carefully reviewing your requirements, I believe I am the perfect fit for this opportunity.

**My Approach:**
Based on your job description, I will deliver a comprehensive solution that meets all your specified requirements. My experience in similar projects ensures high-quality results within your timeline.

**Timeline & Deliverables:**
- Initial concept and wireframes: 3-5 business days
- Development and implementation: 7-10 business days  
- Testing and revisions: 2-3 business days
- Final delivery and documentation: 1-2 business days

**Why Choose Me:**
✅ 5+ years of experience in relevant technologies
✅ 98% project completion rate
✅ Average 4.8/5 client rating
✅ Quick response time (within 2 hours)

I'm committed to delivering exceptional results and building a long-term working relationship. I'd love to discuss your project in more detail.

Best regards,
${user?.firstName || "Your Name"}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGenerateContract = () => {
    if (estimatedTime && estimatedBudget) {
      setContractPreview(`FREELANCE SERVICE AGREEMENT

This agreement is between ${user?.firstName} ${user?.lastName} (Freelancer) and [CLIENT NAME] (Client).

PROJECT DETAILS:
- Estimated Timeline: ${estimatedTime} ${selectedTimeUnit}
- Project Budget: $${estimatedBudget}
- Payment Terms: 50% upfront, 50% upon completion

SCOPE OF WORK:
[Project description and deliverables will be specified here]

TERMS & CONDITIONS:
1. Payment is due within 7 days of invoice
2. Revisions: Up to 3 rounds included
3. Additional work will be quoted separately
4. Client owns final deliverables upon full payment

SIGNATURES:
Freelancer: _________________ Date: _________
Client: _________________ Date: _________`)
    }
  }

  const handleSubmitProposal = async (projectId) => {
    try {
      const response = await apiService.submitProposal({
        projectId,
        proposal: generatedProposal,
        estimatedTime,
        estimatedBudget,
      })

      if (response.success) {
        // Refresh projects
        fetchEarnData()
      }
    } catch (err) {
      console.error("Error submitting proposal:", err)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Add toast notification here
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      case "Medium":
        return "bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]"
      case "Low":
        return "bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]"
      default:
        return "bg-gray-100 dark:bg-[#1E2E26] text-gray-600 dark:text-[#FFD86B]/60"
    }
  }

  const TaskCard = ({ task, columnId }) => (
    <Card className="mb-3 border border-gray-200 dark:border-[#FFD86B]/20 hover:shadow-md transition-all duration-300 cursor-move">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-[#FFD86B] text-sm transition-colors duration-500">
            {task.title}
          </h4>
          <Badge className={`${getPriorityColor(task.priority)} border-0 text-xs`}>{task.priority}</Badge>
        </div>

        <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
          {task.description}
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
              Client: {task.client?.name || "Unknown"}
            </span>
            <span className="font-medium text-[#386641] dark:text-[#FF9433]">${task.budget}</span>
          </div>

          <div className="flex items-center text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{task.deadline}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-[#386641] dark:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {columnId !== "completed" && (
            <Button
              size="sm"
              className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] text-xs px-2 py-1 h-6"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {columnId === "todo" ? "Start" : "Complete"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF4A4]/20 via-white to-[#FED16A]/5 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 flex items-center justify-center">
        <LoadingSpinner size="xl" className="text-[#386641] dark:text-[#FF9433]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4A4]/20 via-white to-[#FED16A]/5 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-[#FFD86B] mb-4 transition-colors duration-500">
            💼 Earn with FreelanceFusion
          </h1>
          <p className="text-xl text-gray-600 dark:text-[#FFD86B]/80 max-w-3xl mx-auto transition-colors duration-500">
            Manage your freelance proposals, tasks, and clients with AI-powered tools
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-[#386641] dark:text-[#FF9433]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                ${freelancerStats.monthlyEarnings?.toLocaleString() || 0}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">This Month</p>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F97A00]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-[#F97A00] dark:text-[#FF9433]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {freelancerStats.activeProjects || 0}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                Active Projects
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#FED16A]/20 dark:bg-[#FFD86B]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-[#b8860b] dark:text-[#FFD86B]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {freelancerStats.averageRating || 0}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">Avg Rating</p>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Timer className="h-6 w-6 text-[#386641] dark:text-[#FF9433]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {freelancerStats.responseTime || "N/A"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                Response Time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Auto Proposal Generator */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <Lightbulb className="h-6 w-6 mr-3 text-[#F97A00] dark:text-[#FF9433]" />
                AI Proposal Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80 mb-2 block transition-colors duration-500">
                    Job Description or Link
                  </label>
                  <Textarea
                    placeholder="Paste the job description or job posting URL here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-32 border-[#F97A00]/20 dark:border-[#FFD86B]/20 focus:border-[#F97A00] dark:focus:border-[#FF9433] transition-colors duration-500"
                  />
                </div>

                <Button
                  onClick={handleGenerateProposal}
                  disabled={!jobDescription.trim() || loading}
                  className="w-full bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Proposal
                </Button>
              </div>

              {/* Generated Proposal Output */}
              {generatedProposal && (
                <div className="bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                      Generated Proposal
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedProposal)}
                        className="border-[#F97A00] dark:border-[#FF9433] text-[#F97A00] dark:text-[#FF9433] hover:bg-[#F97A00] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1E2E26] rounded-lg p-4 border border-gray-200 dark:border-[#FFD86B]/20 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-[#FFD86B]/80 whitespace-pre-wrap font-sans transition-colors duration-500">
                      {generatedProposal}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estimator & Contract Generator */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <FileText className="h-6 w-6 mr-3 text-[#386641] dark:text-[#FF9433]" />
                Contract Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80 mb-2 block transition-colors duration-500">
                      Estimated Time
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 14"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="border-[#386641]/20 dark:border-[#FFD86B]/20 focus:border-[#386641] dark:focus:border-[#FF9433] transition-colors duration-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80 mb-2 block transition-colors duration-500">
                      Time Unit
                    </label>
                    <Select value={selectedTimeUnit} onValueChange={setSelectedTimeUnit}>
                      <SelectTrigger className="border-[#386641]/20 dark:border-[#FFD86B]/20 focus:border-[#386641] dark:focus:border-[#FF9433] transition-colors duration-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80 mb-2 block transition-colors duration-500">
                    Project Budget ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2500"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="border-[#386641]/20 dark:border-[#FFD86B]/20 focus:border-[#386641] dark:focus:border-[#FF9433] transition-colors duration-500"
                  />
                </div>

                <Button
                  onClick={handleGenerateContract}
                  disabled={!estimatedTime || !estimatedBudget}
                  className="w-full bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Contract
                </Button>
              </div>

              {/* Contract Preview */}
              {contractPreview && (
                <div className="bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                      Contract Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#386641] dark:border-[#FF9433] text-[#386641] dark:text-[#FF9433] hover:bg-[#386641] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300 bg-transparent"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1E2E26] rounded-lg p-4 border border-gray-200 dark:border-[#FFD86B]/20 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-[#FFD86B]/80 whitespace-pre-wrap font-sans transition-colors duration-500">
                      {contractPreview}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task & Client Tracker - Kanban Board */}
        <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300 mb-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <Target className="h-6 w-6 mr-3 text-[#386641] dark:text-[#FF9433]" />
                Task & Client Tracker
              </CardTitle>
              <Button className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* To Do Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    To Do
                  </h3>
                  <Badge className="bg-gray-100 dark:bg-[#1E2E26] text-gray-600 dark:text-[#FFD86B]/60 border-0">
                    {tasks.todo.length}
                  </Badge>
                </div>
                <div className="min-h-96 bg-gray-50 dark:bg-[#1E2E26]/20 rounded-lg p-4">
                  {tasks.todo.map((task) => (
                    <TaskCard key={task._id} task={task} columnId="todo" />
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    In Progress
                  </h3>
                  <Badge className="bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433] border-0">
                    {tasks.inProgress.length}
                  </Badge>
                </div>
                <div className="min-h-96 bg-[#F97A00]/5 dark:bg-[#FF9433]/5 rounded-lg p-4">
                  {tasks.inProgress.map((task) => (
                    <TaskCard key={task._id} task={task} columnId="inProgress" />
                  ))}
                </div>
              </div>

              {/* Completed Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    Completed
                  </h3>
                  <Badge className="bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433] border-0">
                    {tasks.completed.length}
                  </Badge>
                </div>
                <div className="min-h-96 bg-[#386641]/5 dark:bg-[#FF9433]/5 rounded-lg p-4">
                  {tasks.completed.map((task) => (
                    <TaskCard key={task._id} task={task} columnId="completed" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Freelancer Dashboard */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings Summary */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <TrendingUp className="h-5 w-5 mr-2 text-[#386641] dark:text-[#FF9433]" />
                Earnings Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    Total Earnings
                  </span>
                  <span className="text-2xl font-bold text-[#386641] dark:text-[#FF9433]">
                    ${freelancerStats.totalEarnings?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    This Month
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    ${freelancerStats.monthlyEarnings?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    Completion Rate
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    {freelancerStats.completionRate || 0}%
                  </span>
                </div>

                <Progress value={freelancerStats.completionRate || 0} className="h-2" />
              </div>

              <Button className="w-full bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                <CreditCard className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Ratings Overview */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <Star className="h-5 w-5 mr-2 text-[#FED16A] dark:text-[#FFD86B]" />
                Ratings Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FED16A] dark:text-[#FFD86B] mb-2">
                  {freelancerStats.averageRating || 0}
                </div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(freelancerStats.averageRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                  Based on {freelancerStats.totalReviews || 0} reviews
                </p>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-[#FFD86B]/70 w-8 transition-colors duration-500">
                      {rating}★
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-[#1E2E26] rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${rating === 5 ? 75 : rating === 4 ? 20 : rating === 3 ? 3 : rating === 2 ? 1 : 1}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-[#FFD86B]/70 w-8 transition-colors duration-500">
                      {rating === 5 ? 35 : rating === 4 ? 9 : rating === 3 ? 2 : rating === 2 ? 1 : 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client History */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                  <Users className="h-5 w-5 mr-2 text-[#386641] dark:text-[#FF9433]" />
                  Client History
                </CardTitle>
                <Button
                  variant="outline"
                  className="border-[#386641] dark:border-[#FF9433] text-[#386641] dark:text-[#FF9433] hover:bg-[#386641] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300 bg-transparent"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientHistory.map((client) => (
                  <div
                    key={client._id}
                    className="p-4 bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E2E26]/50 transition-colors duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-[#FFD86B] text-sm transition-colors duration-500">
                          {client.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                          {client.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                          {client.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
                      <span>{client.projects} projects</span>
                      <span className="font-medium text-[#386641] dark:text-[#FF9433]">
                        ${client.totalPaid?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
                        Last: {client.lastProject}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[#386641] dark:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 text-xs px-2"
                      >
                        Contact
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
