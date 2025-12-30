"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Play,
  Send,
  TrendingUp,
  Award,
  Flame,
  Star,
  BarChart3,
  PieChart,
  Activity,
  BookMarked,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../lib/api"
import { LoadingSpinner } from "./ui/loading"

export default function LearnModule() {
  const { user } = useAuth()
  const [chatMessage, setChatMessage] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real data states
  const [courses, setCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [userStats, setUserStats] = useState({})
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [learningProgress, setLearningProgress] = useState([])
  const [skillDistribution, setSkillDistribution] = useState([])
  const [weeklyActivity, setWeeklyActivity] = useState([])

  const [chatHistory, setChatHistory] = useState([
    {
      type: "assistant",
      message: `Hi ${user?.firstName || "there"}! I'm your AI Learning Assistant. How can I help you today?`,
    },
  ])

  useEffect(() => {
    fetchLearningData()
  }, [])

  const fetchLearningData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all learning-related data
      const [coursesResponse, enrolledResponse, analyticsResponse, eventsResponse] = await Promise.all([
        apiService.getCourses({ limit: 10, featured: true }),
        apiService.getEnrolledCourses(),
        apiService.getAnalyticsDashboard(),
        apiService.getCommunityEvents({ type: "learning", limit: 5 }),
      ])

      if (coursesResponse.success) {
        setCourses(coursesResponse.data.courses || [])
      }

      if (enrolledResponse.success) {
        setEnrolledCourses(enrolledResponse.data.courses || [])
      }

      if (analyticsResponse.success) {
        const analytics = analyticsResponse.data
        setUserStats({
          learningStreak: analytics.learningStreak || 0,
          hoursThisWeek: analytics.hoursThisWeek || 0,
          coursesActive: analytics.activeCourses || 0,
          certificates: analytics.certificates || 0,
        })
        setLearningProgress(analytics.learningProgress || [])
        setSkillDistribution(analytics.skillDistribution || [])
        setWeeklyActivity(analytics.weeklyActivity || [])
      }

      if (eventsResponse.success) {
        setUpcomingEvents(eventsResponse.data.events || [])
      }
    } catch (err) {
      console.error("Error fetching learning data:", err)
      setError(err.message)

      // Fallback to demo data if API fails
      setUserStats({
        learningStreak: 12,
        hoursThisWeek: 18.5,
        coursesActive: 3,
        certificates: 5,
      })

      setEnrolledCourses([
        {
          _id: "1",
          title: "Advanced JavaScript Concepts",
          instructor: { firstName: "Sarah", lastName: "Johnson" },
          progress: 75,
          totalLessons: 24,
          completedLessons: 18,
          nextLesson: "Async/Await Patterns",
          difficulty: "Intermediate",
          rating: 4.8,
          enrolledStudents: 12500,
          thumbnail: "/placeholder.svg?height=200&width=300&text=JS",
        },
        {
          _id: "2",
          title: "React Performance Optimization",
          instructor: { firstName: "Mike", lastName: "Chen" },
          progress: 45,
          totalLessons: 16,
          completedLessons: 7,
          nextLesson: "Memoization Techniques",
          difficulty: "Advanced",
          rating: 4.9,
          enrolledStudents: 8200,
          thumbnail: "/placeholder.svg?height=200&width=300&text=React",
        },
      ])

      setUpcomingEvents([
        {
          _id: "1",
          title: "React Best Practices Workshop",
          date: "2024-02-15",
          time: "2:00 PM EST",
          host: { firstName: "Sarah", lastName: "Johnson" },
          attendees: 245,
          type: "Workshop",
          duration: "2 hours",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      const userMessage = chatMessage.trim()
      setChatHistory((prev) => [...prev, { type: "user", message: userMessage }])
      setChatMessage("")

      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            type: "assistant",
            message:
              "That's a great question! Based on your current progress, I recommend focusing on practical projects to reinforce your learning. Would you like me to suggest some specific exercises?",
          },
        ])
      }, 1000)
    }
  }

  const handleEnrollCourse = async (courseId) => {
    try {
      const response = await apiService.enrollInCourse(courseId)
      if (response.success) {
        // Refresh enrolled courses
        const enrolledResponse = await apiService.getEnrolledCourses()
        if (enrolledResponse.success) {
          setEnrolledCourses(enrolledResponse.data.courses || [])
        }
      }
    } catch (err) {
      console.error("Error enrolling in course:", err)
    }
  }

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await apiService.registerForEvent(eventId)
      if (response.success) {
        // Update event attendance
        setUpcomingEvents((prev) =>
          prev.map((event) =>
            event._id === eventId ? { ...event, attendees: event.attendees + 1, isRegistered: true } : event,
          ),
        )
      }
    } catch (err) {
      console.error("Error joining event:", err)
    }
  }

  // Simple Chart Components (keeping the same implementation)
  const SimpleBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map((d) => d.hours || d.value || 0))

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
          {title}
        </h3>
        <div className="flex items-end justify-between h-48 bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className="w-8 bg-[#386641] dark:bg-[#FF9433] rounded-t transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${((item.hours || item.value || 0) / maxValue) * 120}px`,
                  minHeight: "4px",
                }}
              />
              <span className="text-xs text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                {item.day || item.label}
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                {item.hours || item.value || 0}
                {item.hours ? "h" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const SimpleAreaChart = ({ data, title }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
          {title}
        </h3>
        <div className="bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-4">
          <div className="grid grid-cols-6 gap-4 h-32">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col justify-end items-center space-y-2">
                <div className="flex flex-col items-center space-y-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#386641]/20 to-[#386641]/5 dark:from-[#FF9433]/20 dark:to-[#FF9433]/5 rounded"
                    style={{ height: `${item.hours || item.value || 0}px` }}
                  />
                  <span className="text-xs text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    {item.month || item.label}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    {item.hours || item.value || 0}h
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
                    {item.completed || 0} done
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const SimplePieChart = ({ data, title }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
          {title}
        </h3>
        <div className="bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-4">
          <div className="space-y-3">
            {data.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }} />
                    <span className="text-sm font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                      {skill.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    {skill.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#1E2E26] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${skill.value}%`,
                      backgroundColor: skill.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-[#FFD86B] mb-2 transition-colors duration-500">
                🎓 UniBridge Learning Hub
              </h1>
              <p className="text-lg text-gray-600 dark:text-[#FFD86B]/80 transition-colors duration-500">
                Your personalized AI-powered learning journey
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                <Brain className="h-4 w-4 mr-2" />
                AI Study Plan
              </Button>
              <Button
                variant="outline"
                className="border-[#F97A00] dark:border-[#FF9433] text-[#F97A00] dark:text-[#FF9433] hover:bg-[#F97A00] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300 bg-transparent"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    Learning Streak
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    {userStats.learningStreak} Days
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#F97A00]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center">
                  <Flame className="h-6 w-6 text-[#F97A00] dark:text-[#FF9433]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    Hours This Week
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    {userStats.hoursThisWeek}h
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#386641] dark:text-[#FF9433]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    Courses Active
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    {userStats.coursesActive}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#FED16A]/20 dark:bg-[#FFD86B]/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[#b8860b] dark:text-[#FFD86B]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                    Certificates
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    {userStats.certificates}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#386641] dark:text-[#FF9433]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white dark:bg-[#1E2E26] border border-gray-200 dark:border-[#FFD86B]/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#386641] dark:data-[state=active]:bg-[#FF9433] data-[state=active]:text-white dark:data-[state=active]:text-[#121212]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-[#386641] dark:data-[state=active]:bg-[#FF9433] data-[state=active]:text-white dark:data-[state=active]:text-[#121212]"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="data-[state=active]:bg-[#386641] dark:data-[state=active]:bg-[#FF9433] data-[state=active]:text-white dark:data-[state=active]:text-[#121212]"
            >
              Roadmap
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#386641] dark:data-[state=active]:bg-[#FF9433] data-[state=active]:text-white dark:data-[state=active]:text-[#121212]"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Learning Progress Chart */}
              <div className="lg:col-span-2">
                <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#386641] dark:text-[#FF9433]" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleAreaChart data={learningProgress} title="" />
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant */}
              <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                    <Brain className="h-5 w-5 mr-2 text-[#F97A00] dark:text-[#FF9433]" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] p-3 rounded-lg text-sm transition-colors duration-500 ${
                            chat.type === "user"
                              ? "bg-[#386641] dark:bg-[#FF9433] text-white dark:text-[#121212]"
                              : "bg-white dark:bg-[#1E2E26] text-gray-900 dark:text-[#FFD86B] border border-gray-200 dark:border-[#FFD86B]/20"
                          }`}
                        >
                          {chat.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 border-[#386641]/20 dark:border-[#FFD86B]/20 focus:border-[#386641] dark:focus:border-[#FF9433] transition-colors duration-500"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Courses */}
            <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                    <BookMarked className="h-5 w-5 mr-2 text-[#386641] dark:text-[#FF9433]" />
                    Continue Learning
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledCourses.map((course) => (
                    <Card
                      key={course._id}
                      className="border border-gray-200 dark:border-[#FFD86B]/20 hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <Badge
                            className={`${
                              course.difficulty === "Beginner"
                                ? "bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]"
                                : course.difficulty === "Intermediate"
                                  ? "bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]"
                                  : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                            } border-0 text-xs`}
                          >
                            {course.difficulty}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500 dark:text-[#FFD86B]/60">
                            <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                            {course.rating}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-[#FFD86B] text-sm mb-1 transition-colors duration-500">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                            by {course.instructor?.firstName} {course.instructor?.lastName}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                              Progress
                            </span>
                            <span className="font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                              {course.completedLessons}/{course.totalLessons}
                            </span>
                          </div>
                          <Progress value={course.progress} className="h-1.5" />
                        </div>

                        <div className="pt-2">
                          <Button className="w-full bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] text-xs py-2 transition-all duration-300">
                            Continue: {course.nextLesson}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {enrolledCourses.map((course) => (
                  <Card
                    key={course._id}
                    className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${
                                course.difficulty === "Beginner"
                                  ? "bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]"
                                  : course.difficulty === "Intermediate"
                                    ? "bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]"
                                    : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                              } border-0`}
                            >
                              {course.difficulty}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500 dark:text-[#FFD86B]/60">
                              <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                              {course.rating} ({course.enrolledStudents?.toLocaleString()} students)
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                              Instructor: {course.instructor?.firstName} {course.instructor?.lastName}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                                Course Progress
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                                {course.completedLessons}/{course.totalLessons} lessons ({course.progress}%)
                              </span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:w-48">
                          <Button className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                          <Button
                            variant="outline"
                            className="border-[#F97A00] dark:border-[#FF9433] text-[#F97A00] dark:text-[#FF9433] hover:bg-[#F97A00] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300 bg-transparent"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Upcoming Events Sidebar */}
              <div className="space-y-4">
                <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                      <Calendar className="h-5 w-5 mr-2 text-[#F97A00] dark:text-[#FF9433]" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event._id} className="p-3 bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`${
                              event.type === "Workshop"
                                ? "bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]"
                                : event.type === "Webinar"
                                  ? "bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]"
                                  : "bg-[#FED16A]/20 dark:bg-[#FFD86B]/20 text-[#b8860b] dark:text-[#FFD86B]"
                            } border-0 text-xs`}
                          >
                            {event.type}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
                            {event.duration}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                          {event.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                          <span>{event.date}</span>
                          <span>{event.time}</span>
                        </div>
                        <Button
                          onClick={() => handleJoinEvent(event._id)}
                          className="w-full bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] text-xs py-1.5 transition-all duration-300"
                        >
                          {event.isRegistered ? "Registered" : "Join Event"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                    <Activity className="h-5 w-5 mr-2 text-[#F97A00] dark:text-[#FF9433]" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={weeklyActivity} title="" />
                </CardContent>
              </Card>

              {/* Skill Distribution */}
              <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                    <PieChart className="h-5 w-5 mr-2 text-[#386641] dark:text-[#FF9433]" />
                    Skill Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart data={skillDistribution} title="" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
