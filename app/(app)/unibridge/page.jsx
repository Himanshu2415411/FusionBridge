"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"
import apiService from "@/lib/api"
import { LoadingPage } from "@/components/ui/loading"
import UniBridgeOverview from "@/components/modules/unibridge/unibridge-overview"
import ContinueLearning from "@/components/modules/unibridge/continue-learning"
import CourseGrid from "@/components/modules/unibridge/course-grid"
import LearningActivity from "@/components/modules/unibridge/learning-activity"
import { useErrorHandler } from "@/hooks/use-error-handler"

const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false)
  }

  if (window.Razorpay) {
    return Promise.resolve(true)
  }

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true })
      existingScript.addEventListener("error", () => resolve(false), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function UniBridgePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [progressCourses, setProgressCourses] = useState([])
  const [courses, setCourses] = useState([])
  const [activities, setActivities] = useState([])
  const { handleError, handleWarning, handleSuccess } = useErrorHandler()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [progressRes, coursesRes, activityRes] = await Promise.all([
        apiService.request("/progress").catch(() => null),
        apiService.request("/courses").catch(() => null),
        apiService.request("/activity").catch(() => null),
      ])

      if (progressRes?.stats) setStats(progressRes.stats)
      if (progressRes?.courses) setProgressCourses(progressRes.courses)

      if (Array.isArray(coursesRes)) setCourses(coursesRes)
      else if (coursesRes?.courses) setCourses(coursesRes.courses)
      else if (coursesRes) setCourses(Array.isArray(coursesRes) ? coursesRes : [])

      if (Array.isArray(activityRes)) setActivities(activityRes)
      else if (activityRes?.activities) setActivities(activityRes.activities)
      else if (activityRes) setActivities(Array.isArray(activityRes) ? activityRes : [])
    } catch (err) {
      handleError(err, "UniBridgePage.fetchAll")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      const course = courses.find((item) => (item._id || item.id)?.toString?.() === courseId)
      const courseData = course || (await apiService.getCourse(courseId))
      const normalizedCourse = courseData?.course || courseData
      const firstLesson = normalizedCourse?.lessons?.[0]

      if (!normalizedCourse) {
        throw new Error("Course not found")
      }

      if (!firstLesson) {
        throw new Error("No lessons available")
      }

      if (normalizedCourse.isEnrolled) {
        router.push(`/unibridge/learn/${courseId}/${firstLesson._id}`)
        return
      }

      if (Number(normalizedCourse.price) <= 0) {
        await apiService.enrollInCourse(courseId)
        handleSuccess("Enrollment completed successfully")
        await fetchAll()
        router.push(`/unibridge/learn/${courseId}/${firstLesson._id}`)
        return
      }

      const paymentOrder = await apiService.createPayment({
        itemType: "course",
        itemId: courseId,
        metadata: {
          courseTitle: normalizedCourse.title,
          courseCategory: normalizedCourse.category,
        },
      })

      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout")
      }

      const RazorpayCheckout = window.Razorpay

      if (!RazorpayCheckout) {
        throw new Error("Razorpay checkout is unavailable")
      }

      const checkout = new RazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || paymentOrder.keyId,
        amount: paymentOrder.order.amount,
        currency: paymentOrder.order.currency,
        order_id: paymentOrder.order.id,
        name: "FusionBridge",
        description: paymentOrder.description || normalizedCourse.title,
        notes: {
          itemType: "course",
          itemId: courseId,
          courseTitle: normalizedCourse.title,
        },
        modal: {
          ondismiss: () => {
            handleWarning("Payment cancelled")
          },
        },
        handler: async (response) => {
          try {
            await apiService.verifyPayment({
              orderId: paymentOrder.order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              itemType: "course",
              itemId: courseId,
            })

            handleSuccess("Payment verified successfully")
            await fetchAll()
            router.push(`/unibridge/learn/${courseId}/${firstLesson._id}`)
          } catch (verificationError) {
            handleError(verificationError, "UniBridgePage.handleEnroll.verifyPayment")
          }
        },
        theme: {
          color: "#F97A00",
        },
      })

      checkout.on("payment.failed", (response) => {
        handleError(new Error(response?.error?.description || "Payment failed"), "UniBridgePage.paymentFailed")
      })

      checkout.open()
    } catch (err) {
      handleError(err, "UniBridgePage.handleEnroll")
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-[#FED16A]/30 flex items-center justify-center shrink-0">
          <GraduationCap className="h-6 w-6 text-[#386641]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">UniBridge</h1>
          <p className="text-sm text-muted-foreground">
            Your learning command center
          </p>
        </div>
      </motion.div>

      {/* Section 1 — Learning Overview */}
      <UniBridgeOverview stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Continue Learning + Course Explorer */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 2 — Continue Learning */}
          <ContinueLearning courses={progressCourses} />

          {/* Section 3 — Course Explorer */}
          <CourseGrid courses={courses} onEnroll={handleEnroll} />
        </div>

        {/* Right — Learning Activity Feed */}
        <div>
          <LearningActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}

