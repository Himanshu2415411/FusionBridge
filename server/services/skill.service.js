const CareerProfile = require("../models/CareerProfile")
const Certificate = require("../models/Certificate")
const Course = require("../models/Course")

async function analyzeUserSkills(userId) {
  const profile = await CareerProfile.findOne({ user: userId })
  const knownSkills = profile?.skills ?? []

  const certificates = await Certificate.find({ user: userId }).populate("course")
  const inferredSkills = certificates.map(
    (cert) => cert.course?.title ?? cert.courseTitle
  )

  return { knownSkills, inferredSkills }
}

module.exports = {
  analyzeUserSkills,
}
