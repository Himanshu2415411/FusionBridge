const ProjectIdea = require("../models/ProjectIdea")

const PROJECT_TEMPLATES = [
  {
    keywords: ["react"],
    title: "Real-time Task Manager",
    description:
      "Build a collaborative task management app with real-time updates, drag-and-drop boards, and user assignments.",
    techStack: ["React", "Node.js", "Socket.io", "MongoDB"],
    difficulty: "intermediate",
    estimatedTime: "3-4 weeks",
  },
  {
    keywords: ["node", "node.js", "express"],
    title: "REST API for Blog Platform",
    description:
      "Design and implement a fully documented REST API supporting posts, comments, authentication, and pagination.",
    techStack: ["Node.js", "Express", "MongoDB", "JWT"],
    difficulty: "intermediate",
    estimatedTime: "2-3 weeks",
  },
  {
    keywords: ["javascript", "js"],
    title: "Interactive Data Visualization Dashboard",
    description:
      "Create a browser-based dashboard that fetches data from a public API and renders interactive charts and graphs.",
    techStack: ["JavaScript", "D3.js", "HTML", "CSS"],
    difficulty: "beginner",
    estimatedTime: "1-2 weeks",
  },
  {
    keywords: ["python"],
    title: "Automated Web Scraper & Report Generator",
    description:
      "Build a scheduled scraper that collects data from websites and exports structured reports as CSV or PDF.",
    techStack: ["Python", "BeautifulSoup", "Pandas", "Cron"],
    difficulty: "intermediate",
    estimatedTime: "2-3 weeks",
  },
  {
    keywords: ["mongodb", "mongoose"],
    title: "Real-time Chat Application",
    description:
      "Develop a multi-room chat app with message history stored in MongoDB and real-time delivery via WebSockets.",
    techStack: ["Node.js", "Socket.io", "MongoDB", "React"],
    difficulty: "advanced",
    estimatedTime: "4-5 weeks",
  },
  {
    keywords: ["css", "html", "tailwind"],
    title: "Personal Portfolio Website",
    description:
      "Design a responsive, animated portfolio site showcasing projects, skills, and a contact form.",
    techStack: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
    difficulty: "beginner",
    estimatedTime: "1 week",
  },
  {
    keywords: ["typescript", "ts"],
    title: "Type-Safe CLI Tool",
    description:
      "Build a command-line utility with argument parsing, configuration file support, and thorough TypeScript typings.",
    techStack: ["TypeScript", "Node.js", "Commander.js"],
    difficulty: "intermediate",
    estimatedTime: "2 weeks",
  },
  {
    keywords: ["next", "next.js"],
    title: "E-commerce Storefront",
    description:
      "Create a server-side rendered storefront with product listings, a cart, and checkout integration.",
    techStack: ["Next.js", "React", "Stripe", "Tailwind CSS"],
    difficulty: "advanced",
    estimatedTime: "4-6 weeks",
  },
]

async function generateProjects(userId, skills) {
  const allSkills = [
    ...(skills.knownSkills ?? []),
    ...(skills.inferredSkills ?? []),
  ].map((s) => s.toLowerCase())

  const matched = PROJECT_TEMPLATES.filter((template) =>
    template.keywords.some((kw) => allSkills.some((skill) => skill.includes(kw)))
  )

  // Fall back to beginner projects if no skills matched anything
  const templates = matched.length ? matched : PROJECT_TEMPLATES.filter((t) => t.difficulty === "beginner")

  const docs = templates.map((t) => ({
    user: userId,
    title: t.title,
    description: t.description,
    techStack: t.techStack,
    difficulty: t.difficulty,
    estimatedTime: t.estimatedTime,
    generatedFromSkills: allSkills,
  }))

  const saved = await ProjectIdea.insertMany(docs)
  return saved
}

module.exports = {
  generateProjects,
}
