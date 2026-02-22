const express = require("express")
const User = require("../models/User")
const Course = require("../models/Course")

const router = express.Router()

router.get("/verify/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params

    const user = await User.findOne({
      "enrolledCourses.certificateId": certificateId
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.certificateId === certificateId
    )

    const course = await Course.findById(enrollment.course)
      .populate("instructor", "firstName lastName")

    res.json({
      success: true,
      data: {
        certificateId,
        studentName: `${user.firstName} ${user.lastName}`,
        courseTitle: course.title,
        instructor: `${course.instructor.firstName} ${course.instructor.lastName}`,
        completedAt: enrollment.completedAt,
        verified: true
      }
    })

  } catch (error) {
    console.error("Certificate verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

router.get("/public/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params

    const user = await User.findOne({
      "enrolledCourses.certificateId": certificateId
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.certificateId === certificateId
    )

    const course = await Course.findById(enrollment.course)
      .populate("instructor", "firstName lastName avatar")

    res.json({
      success: true,
      data: {
        certificateId,
        student: {
          name: `${user.firstName} ${user.lastName}`,
        },
        course: {
          title: course.title,
          category: course.category,
          level: course.level,
        },
        instructor: {
          name: `${course.instructor.firstName} ${course.instructor.lastName}`,
          avatar: course.instructor.avatar,
        },
        completedAt: enrollment.completedAt,
        verified: true
      }
    })

  } catch (error) {
    console.error("Public certificate error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

module.exports = router