const User = require("../models/User")
const CareerProfile = require("../models/CareerProfile")
const Certificate = require("../models/Certificate")
const Course = require("../models/Course")

async function generateResume(userId) {
  const user = await User.findById(userId)
  const profile = await CareerProfile.findOne({ user: userId })
  const certificates = await Certificate.find({ user: userId }).populate("course")

  const completedCourses = certificates.map(
    (cert) => cert.course?.title ?? cert.courseTitle
  )

  const resume = {
    personalInfo: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
    skills: profile?.skills ?? [],
    targetRole: profile?.targetRole ?? null,
    education: profile?.education ?? [],
    experience: profile?.experience ?? [],
    projects: profile?.projects ?? [],
    completedCourses,
    certificates,
  }

  return resume
}

module.exports = {
  generateResume,
}
