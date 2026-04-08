"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function CertificateCard({ courseId }) {
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return

    const fetchCertificate = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `http://localhost:5000/api/certificates/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        if (!response.ok) throw new Error("Failed to fetch certificate")
        const data = await response.json()
        setCertificate(data.certificate || data.data || data)
      } catch (error) {
        console.error("Failed to fetch certificate:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [courseId])

  if (loading) {
    return <div className="text-center py-6 text-[#386641]">Loading certificate...</div>
  }

  if (!certificate || !certificate.id) {
    return <div className="text-center py-6 text-[#386641]/70">Certificate not found.</div>
  }

  return (
    <Card className="rounded-xl border shadow-sm mt-6 border-[#FED16A] overflow-hidden bg-white">
      <CardContent className="p-8 text-center space-y-6">
        <div className="border-[8px] border-[#FFF4A4] rounded-lg p-8 space-y-4 relative">
          <p className="text-lg font-medium text-gray-500 uppercase tracking-widest">Certificate of Completion</p>
          <h2 className="text-3xl font-bold text-[#F97A00]">
            {certificate.userName || "Student Name"}
          </h2>
          <p className="text-gray-600">has successfully completed the course</p>
          <h3 className="text-2xl font-bold text-[#386641] px-4">
            {certificate.courseName || "Course Title"}
          </h3>
          <p className="text-sm text-gray-400 mt-4">
            Date: {certificate.completionDate ? new Date(certificate.completionDate).toLocaleDateString() : new Date().toLocaleDateString()}
          </p>
        </div>
        
        <Button className="bg-[#386641] hover:bg-[#386641]/90 text-white rounded-xl px-6">
          <Download className="w-5 h-5 mr-2" />
          Download Certificate
        </Button>
      </CardContent>
    </Card>
  )
}
