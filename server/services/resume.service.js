const User = require("../models/User")
const CareerProfile = require("../models/CareerProfile")
const Certificate = require("../models/Certificate")
const Course = require("../models/Course")
const Resume = require("../models/Resume")
const PDFDocument = require("pdfkit")

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

async function saveResume(userId, resumeData) {
  const saved = await Resume.create({ user: userId, resumeData })
  return saved
}

async function generateResumePDF(resumeData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    // Name
    doc.fontSize(22).font("Helvetica-Bold").text(resumeData.personalInfo.name, { align: "center" })
    doc.fontSize(11).font("Helvetica").text(resumeData.personalInfo.email, { align: "center" })

    if (resumeData.targetRole) {
      doc.moveDown(0.5).fontSize(13).font("Helvetica-Oblique").text(resumeData.targetRole, { align: "center" })
    }

    doc.moveDown().moveTo(50, doc.y).lineTo(545, doc.y).stroke()

    // Skills
    if (resumeData.skills?.length) {
      doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Skills")
      doc.fontSize(11).font("Helvetica").text(resumeData.skills.join(", "))
    }

    // Education
    if (resumeData.education?.length) {
      doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Education")
      resumeData.education.forEach((edu) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`${edu.degree} in ${edu.fieldOfStudy}`, { continued: true })
        doc.font("Helvetica").text(` — ${edu.institution} (${edu.startYear ?? ""}${edu.endYear ? " - " + edu.endYear : ""})`)
      })
    }

    // Experience
    if (resumeData.experience?.length) {
      doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Experience")
      resumeData.experience.forEach((exp) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`${exp.role}`, { continued: true })
        doc.font("Helvetica").text(` — ${exp.company}`)
        if (exp.description) {
          doc.fontSize(10).font("Helvetica").text(exp.description, { indent: 10 })
        }
      })
    }

    // Projects
    if (resumeData.projects?.length) {
      doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Projects")
      resumeData.projects.forEach((proj) => {
        doc.fontSize(11).font("Helvetica-Bold").text(proj.title)
        if (proj.description) {
          doc.fontSize(10).font("Helvetica").text(proj.description, { indent: 10 })
        }
        if (proj.techStack?.length) {
          doc.fontSize(10).font("Helvetica-Oblique").text(`Tech: ${proj.techStack.join(", ")}`, { indent: 10 })
        }
      })
    }

    // Completed Courses
    if (resumeData.completedCourses?.length) {
      doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Completed Courses")
      resumeData.completedCourses.forEach((course) => {
        doc.fontSize(11).font("Helvetica").text(`• ${course}`, { indent: 10 })
      })
    }

    doc.end()
  })
}

function analyzeResume(resumeData) {
  let score = 0
  const suggestions = []

  if (resumeData.skills?.length) {
    score += 20
  } else {
    suggestions.push("Add your technical skills")
  }

  if (resumeData.projects?.length) {
    score += 20
  } else {
    suggestions.push("Add more projects")
  }

  if (resumeData.education?.length) {
    score += 20
  } else {
    suggestions.push("Include your education details")
  }

  if (resumeData.experience?.length) {
    score += 20
  } else {
    suggestions.push("Add work experience")
  }

  if (resumeData.completedCourses?.length) {
    score += 20
  } else {
    suggestions.push("Complete courses to boost your profile")
  }

  suggestions.push("Include measurable achievements")
  suggestions.push("List technologies in projects")

  return { score, suggestions }
}

module.exports = {
  generateResume,
  saveResume,
  generateResumePDF,
  analyzeResume,
}
