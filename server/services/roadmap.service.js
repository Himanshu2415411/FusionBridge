const roleSkills = require("../utils/roleSkills")
const CareerProfile = require("../models/CareerProfile")
const Certificate = require("../models/Certificate")

async function generateCareerRoadmap(userId) {
  const profile = await CareerProfile.findOne({ user: userId })
  const targetRole = profile?.targetRole ?? null

  const requiredSkills = targetRole
    ? (roleSkills[targetRole] ?? [])
    : []

  const knownSkills = [
    ...(profile?.skills ?? []),
  ]

  const certificates = await Certificate.find({ user: userId }).populate("course")
  const completedCourses = certificates.map(
    (cert) => cert.course?.title ?? cert.courseTitle
  )

  // Treat completed course titles as additional known skills for gap analysis
  const allKnownSkills = [
    ...new Set([
      ...knownSkills.map((s) => s.toLowerCase()),
      ...completedCourses.map((c) => c.toLowerCase()),
    ]),
  ]

  const missingSkills = requiredSkills.filter(
    (skill) => !allKnownSkills.some((known) => known.includes(skill.toLowerCase()))
  )

  // Recommend the first 3 missing skills as the immediate next steps
  const recommendedNextSkills = missingSkills.slice(0, 3)

  const roadmap = {
    role: targetRole,
    requiredSkills,
    knownSkills: profile?.skills ?? [],
    completedCourses,
    missingSkills,
    recommendedNextSkills,
  }

  return roadmap
}

module.exports = {
  generateCareerRoadmap,
}
