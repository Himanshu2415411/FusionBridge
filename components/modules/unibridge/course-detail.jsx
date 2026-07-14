"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, BookOpen, Loader2 } from "lucide-react"
import apiService from "@/lib/api"
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

export function CourseDetail({ course }) {
  const router = useRouter()
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const { handleError, handleWarning, handleSuccess } = useErrorHandler()

  useEffect(() => {
    setIsEnrolled(course?.isEnrolled || false)
  }, [course])

  if (!course) return null

  const handleEnroll = async () => {
    // If already enrolled, navigate to first lesson
    if (isEnrolled) {
      const firstLesson = course.lessons?.[0]

      if (!firstLesson) {
        handleWarning("No lessons available")
        return
      }

      router.push(`/unibridge/learn/${course._id}/${firstLesson._id}`)
      return
    }

    try {
      setIsEnrolling(true)

      const firstLesson = course.lessons?.[0]

      if (!firstLesson) {
        throw new Error("No lessons available")
      }

      if (Number(course.price) <= 0) {
        await apiService.enrollInCourse(course._id)

        setIsEnrolled(true)
        handleSuccess("Enrollment completed successfully")
        router.push(`/unibridge/learn/${course._id}/${firstLesson._id}`)
        return
      }

      const paymentOrder = await apiService.createPayment({
        itemType: "course",
        itemId: course._id,
        metadata: {
          courseTitle: course.title,
          courseCategory: course.category,
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
        key: paymentOrder.keyId,
        amount: paymentOrder.order.amount,
        currency: paymentOrder.order.currency,
        order_id: paymentOrder.order.id,
        name: "FusionBridge",
        description: paymentOrder.description || course.title,
        notes: {
          itemType: "course",
          itemId: course._id,
          courseTitle: course.title,
        },
        modal: {
          ondismiss: () => {
            setIsEnrolling(false)
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
              itemId: course._id,
            })

            setIsEnrolled(true)
            handleSuccess("Payment verified successfully")
            router.push(`/unibridge/learn/${course._id}/${firstLesson._id}`)
          } catch (verificationError) {
            handleError(verificationError, "CourseDetail.verifyPayment")
          } finally {
            setIsEnrolling(false)
          }
        },
        theme: {
          color: "#F97A00",
        },
      })

      checkout.on("payment.failed", (response) => {
        setIsEnrolling(false)
        handleError(new Error(response?.error?.description || "Payment failed"), "CourseDetail.paymentFailed")
      })

      checkout.open()
    } catch (error) {
      setIsEnrolling(false)
      handleError(error, "CourseDetail.handleEnroll")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      <Card className="rounded-xl border shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-start mb-4">
            <Badge className="bg-[#FED16A] text-[#386641] hover:bg-[#FED16A]/80 text-sm px-3 py-1 border-none">
              {course.category || 'General'}
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold text-[#386641]">{course.title}</CardTitle>
          <CardDescription className="text-base mt-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="bg-[#F97A00] hover:bg-[#F97A00]/90 text-white px-8 py-6 text-lg rounded-xl shadow-md"
          >
            {isEnrolling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {isEnrolling ? "Processing..." : isEnrolled ? "Go to Course" : Number(course.price) > 0 ? "Pay & Enroll" : "Enroll Now"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-[#386641] flex items-center">
          <BookOpen className="mr-2 h-6 w-6" />
          Lessons
        </h3>

        <div className="grid gap-3">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson) => (
              <Card
                key={lesson._id}
                className={`rounded-xl border shadow-sm bg-white transition ${
                  isEnrolled ? "cursor-pointer hover:bg-gray-50" : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (!isEnrolled) return
                  router.push(`/unibridge/learn/${course._id}/${lesson._id}`)
                }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-[#FFF4A4] flex items-center justify-center text-[#F97A00]">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#386641]">{lesson.title}</p>
                      <p className="text-sm text-gray-500">{lesson.duration || "10 mins"}</p>
                    </div>
                  </div>
                  {!isEnrolled ? <Badge variant="secondary">Locked</Badge> : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-[#386641]/70 italic p-4">No lessons available for this course yet.</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
