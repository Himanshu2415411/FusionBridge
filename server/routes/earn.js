const express = require("express")
const { body, validationResult } = require("express-validator")
const { auth, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Mock data for earn module
const mockProjects = [
  {
    id: "1",
    title: "E-commerce Website Development",
    description:
      "Build a modern e-commerce platform with React and Node.js. Must include user authentication, product catalog, shopping cart, and payment integration.",
    budget: "$2,500 - $5,000",
    duration: "4-6 weeks",
    skillsRequired: ["React", "Node.js", "MongoDB", "Payment Integration"],
    difficulty: "Intermediate",
    client: {
      name: "TechStart Inc.",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      reviewsCount: 23,
    },
    postedDate: "2024-01-10",
    proposals: 12,
    category: "Web Development",
    tags: ["react", "nodejs", "ecommerce", "fullstack"],
    status: "open",
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    description:
      "Design a clean and modern mobile app interface for a fitness tracking application. Need wireframes, mockups, and interactive prototypes.",
    budget: "$1,200 - $2,000",
    duration: "2-3 weeks",
    skillsRequired: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping"],
    difficulty: "Beginner",
    client: {
      name: "FitLife Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      reviewsCount: 15,
    },
    postedDate: "2024-01-12",
    proposals: 8,
    category: "Design",
    tags: ["ui", "ux", "mobile", "figma"],
    status: "open",
  },
  {
    id: "3",
    title: "Data Analysis & Visualization",
    description:
      "Analyze sales data and create interactive dashboards using Python and Tableau. Need to identify trends and provide actionable insights.",
    budget: "$1,800 - $3,200",
    duration: "3-4 weeks",
    skillsRequired: ["Python", "Pandas", "Tableau", "Data Analysis"],
    difficulty: "Advanced",
    client: {
      name: "DataCorp Analytics",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      reviewsCount: 31,
    },
    postedDate: "2024-01-08",
    proposals: 15,
    category: "Data Science",
    tags: ["python", "data-analysis", "tableau", "visualization"],
    status: "open",
  },
]

const mockFreelancers = [
  {
    id: "1",
    name: "Alex Thompson",
    avatar: "/placeholder.svg?height=60&width=60",
    title: "Full-Stack Developer",
    rating: 4.9,
    reviewsCount: 47,
    hourlyRate: "$45-65/hr",
    skills: ["React", "Node.js", "Python", "AWS"],
    completedProjects: 23,
    successRate: "98%",
    location: "San Francisco, CA",
    availability: "Available",
    portfolio: [
      {
        title: "E-commerce Platform",
        image: "/placeholder.svg?height=200&width=300",
        description: "Modern e-commerce solution built with React and Node.js",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Kim",
    avatar: "/placeholder.svg?height=60&width=60",
    title: "UI/UX Designer",
    rating: 4.8,
    reviewsCount: 32,
    hourlyRate: "$35-50/hr",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
    completedProjects: 18,
    successRate: "96%",
    location: "New York, NY",
    availability: "Available",
    portfolio: [
      {
        title: "Mobile Banking App",
        image: "/placeholder.svg?height=200&width=300",
        description: "Clean and intuitive mobile banking interface design",
      },
    ],
  },
]

const mockEarnings = {
  totalEarned: 12450,
  thisMonth: 2850,
  pendingPayments: 1200,
  completedProjects: 8,
  activeProjects: 2,
  averageRating: 4.8,
  earnings: [
    { month: "Jan", amount: 2850 },
    { month: "Dec", amount: 3200 },
    { month: "Nov", amount: 2100 },
    { month: "Oct", amount: 2800 },
    { month: "Sep", amount: 1500 },
  ],
}

// @route   GET /api/earn/projects
// @desc    Get available projects
// @access  Public
router.get("/projects", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, budget, search, sort = "postedDate" } = req.query

    let filteredProjects = [...mockProjects]

    // Filter by category
    if (category && category !== "all") {
      filteredProjects = filteredProjects.filter((project) => project.category === category)
    }

    // Filter by difficulty
    if (difficulty && difficulty !== "all") {
      filteredProjects = filteredProjects.filter((project) => project.difficulty === difficulty)
    }

    // Search functionality
    if (search) {
      filteredProjects = filteredProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(search.toLowerCase()) ||
          project.description.toLowerCase().includes(search.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Sort projects
    filteredProjects.sort((a, b) => {
      if (sort === "budget") {
        const aBudget = Number.parseInt(a.budget.match(/\$(\d+)/)[1])
        const bBudget = Number.parseInt(b.budget.match(/\$(\d+)/)[1])
        return bBudget - aBudget
      }
      if (sort === "proposals") {
        return a.proposals - b.proposals
      }
      return new Date(b.postedDate) - new Date(a.postedDate)
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + Number.parseInt(limit)
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    res.json({
      success: true,
      projects: paginatedProjects,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(filteredProjects.length / limit),
        total: filteredProjects.length,
      },
    })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/earn/projects/:id
// @desc    Get single project
// @access  Public
router.get("/projects/:id", optionalAuth, async (req, res) => {
  try {
    const project = mockProjects.find((p) => p.id === req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    res.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/earn/projects/:id/propose
// @desc    Submit proposal for project
// @access  Private
router.post(
  "/projects/:id/propose",
  [
    auth,
    body("coverLetter").trim().isLength({ min: 50, max: 1000 }),
    body("proposedBudget").isNumeric(),
    body("timeline").trim().isLength({ min: 5, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const project = mockProjects.find((p) => p.id === req.params.id)

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        })
      }

      const { coverLetter, proposedBudget, timeline } = req.body

      const proposal = {
        id: Date.now().toString(),
        freelancer: {
          id: req.user._id,
          name: req.user.fullName,
          avatar: req.user.avatar,
          rating: 4.8, // This would come from user's actual rating
        },
        coverLetter,
        proposedBudget,
        timeline,
        submittedAt: new Date(),
        status: "pending",
      }

      // In a real app, save proposal to database
      project.proposals += 1

      res.status(201).json({
        success: true,
        message: "Proposal submitted successfully",
        proposal,
      })
    } catch (error) {
      console.error("Submit proposal error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/earn/freelancers
// @desc    Get freelancer profiles
// @access  Public
router.get("/freelancers", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, skills, location, availability, search } = req.query

    let filteredFreelancers = [...mockFreelancers]

    // Filter by skills
    if (skills) {
      const skillArray = skills.split(",")
      filteredFreelancers = filteredFreelancers.filter((freelancer) =>
        freelancer.skills.some((skill) => skillArray.includes(skill)),
      )
    }

    // Filter by availability
    if (availability && availability !== "all") {
      filteredFreelancers = filteredFreelancers.filter((freelancer) => freelancer.availability === availability)
    }

    // Search functionality
    if (search) {
      filteredFreelancers = filteredFreelancers.filter(
        (freelancer) =>
          freelancer.name.toLowerCase().includes(search.toLowerCase()) ||
          freelancer.title.toLowerCase().includes(search.toLowerCase()) ||
          freelancer.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + Number.parseInt(limit)
    const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex)

    res.json({
      success: true,
      freelancers: paginatedFreelancers,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(filteredFreelancers.length / limit),
        total: filteredFreelancers.length,
      },
    })
  } catch (error) {
    console.error("Get freelancers error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/earn/dashboard
// @desc    Get freelancer dashboard data
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    // In a real app, fetch user's actual earnings and project data
    const dashboardData = {
      ...mockEarnings,
      recentProjects: mockProjects.slice(0, 3),
      activeProposals: 3,
      profileViews: 45,
      profileCompleteness: 85,
    }

    res.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/earn/projects
// @desc    Post new project (for clients)
// @access  Private
router.post(
  "/projects",
  [
    auth,
    body("title").trim().isLength({ min: 10, max: 100 }),
    body("description").trim().isLength({ min: 50, max: 2000 }),
    body("budget").notEmpty(),
    body("duration").notEmpty(),
    body("skillsRequired").isArray({ min: 1 }),
    body("category").notEmpty(),
    body("difficulty").isIn(["Beginner", "Intermediate", "Advanced"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const projectData = {
        id: Date.now().toString(),
        ...req.body,
        client: {
          name: req.user.fullName,
          avatar: req.user.avatar,
          rating: 4.8, // This would come from user's actual rating
          reviewsCount: 10,
        },
        postedDate: new Date().toISOString().split("T")[0],
        proposals: 0,
        status: "open",
        tags: req.body.skillsRequired.map((skill) => skill.toLowerCase()),
      }

      // In a real app, save to database
      mockProjects.unshift(projectData)

      res.status(201).json({
        success: true,
        message: "Project posted successfully",
        project: projectData,
      })
    } catch (error) {
      console.error("Post project error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/earn/categories
// @desc    Get project categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      "Web Development",
      "Mobile Development",
      "Design",
      "Data Science",
      "Machine Learning",
      "DevOps",
      "Content Writing",
      "Digital Marketing",
      "Video Editing",
      "Translation",
    ]

    res.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/earn/skills
// @desc    Get available skills
// @access  Public
router.get("/skills", async (req, res) => {
  try {
    const skills = [
      "React",
      "Node.js",
      "Python",
      "JavaScript",
      "TypeScript",
      "Vue.js",
      "Angular",
      "PHP",
      "Java",
      "C#",
      "Swift",
      "Kotlin",
      "Flutter",
      "React Native",
      "Figma",
      "Adobe XD",
      "Photoshop",
      "Illustrator",
      "UI/UX Design",
      "Graphic Design",
      "Data Analysis",
      "Machine Learning",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Kubernetes",
    ]

    res.json({
      success: true,
      skills,
    })
  } catch (error) {
    console.error("Get skills error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
