const eventBus = require("./eventBus")
const EVENT_TYPES = require("./eventTypes")
const { createActivity } = require("../services/activity.service")
const { createNotification } = require("../services/notification.service")

function registerEventListeners() {
  eventBus.on(EVENT_TYPES.LESSON_COMPLETED, async (payload) => {
    console.log("Lesson completed event received:", payload)
    await createActivity(payload.userId, "lesson_completed", "Completed a lesson", payload)
    await createNotification(payload.userId, "lesson_completed", "You completed a lesson.")
  })

  eventBus.on(EVENT_TYPES.COURSE_COMPLETED, async (payload) => {
    console.log("Course completed event received:", payload)
    await createActivity(payload.userId, "course_completed", "Completed a course", payload)
    await createNotification(payload.userId, "course_completed", "You completed a course.")
  })

  eventBus.on(EVENT_TYPES.CERTIFICATE_EARNED, async (payload) => {
    console.log("Certificate earned event received:", payload)
    await createActivity(payload.userId, "certificate_earned", "Earned a certificate", payload)
    await createNotification(payload.userId, "certificate_earned", "You earned a certificate.")
  })

  eventBus.on(EVENT_TYPES.RESUME_GENERATED, async (payload) => {
    console.log("Resume generated event:", payload)
    await createActivity(payload.userId, "resume_generated", "Generated a resume", payload)
    await createNotification(payload.userId, "resume_ready", "Your resume has been generated.")
  })

  eventBus.on(EVENT_TYPES.PROJECT_IDEA_CREATED, async (payload) => {
    console.log("Project idea created event:", payload)
    await createActivity(payload.userId, "project_created", "Created a project idea", payload)
    await createNotification(payload.userId, "project_generated", "A new project idea was generated for you.")
  })

  eventBus.on(EVENT_TYPES.FREELANCE_PROJECT_CREATED, async (payload) => {
    console.log("Freelance project created:", payload)
    await createActivity(payload.userId, "freelance_project_created", "Created a freelance project", payload)
    await createNotification(payload.userId, "freelance_project_created", "You created a freelance project.")
  })
}

module.exports = registerEventListeners
