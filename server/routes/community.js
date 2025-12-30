const express = require("express")
const { body, validationResult } = require("express-validator")
const { auth, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Mock data for community features
const mockPosts = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 15,
    },
    content:
      "Just completed the Advanced React course! The hooks section was incredibly helpful. Anyone else working through this?",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    tags: ["react", "javascript", "frontend"],
    type: "achievement",
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 12,
    },
    content:
      "Looking for study partners for the Machine Learning fundamentals course. Anyone interested in forming a study group?",
    timestamp: "4 hours ago",
    likes: 18,
    comments: 12,
    tags: ["machine-learning", "python", "study-group"],
    type: "discussion",
  },
  {
    id: "3",
    author: {
      id: "user3",
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 20,
    },
    content:
      "Pro tip: When learning Node.js, make sure to understand the event loop early on. It'll save you hours of debugging later!",
    timestamp: "6 hours ago",
    likes: 45,
    comments: 15,
    tags: ["nodejs", "javascript", "backend", "tips"],
    type: "tip",
  },
]

const mockEvents = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Hands-on workshop covering modern web development practices",
    date: "2024-01-15",
    time: "2:00 PM EST",
    attendees: 45,
    maxAttendees: 50,
    type: "workshop",
    tags: ["web-development", "javascript", "css"],
  },
  {
    id: "2",
    title: "AI/ML Study Group",
    description: "Weekly study group for machine learning enthusiasts",
    date: "2024-01-18",
    time: "7:00 PM EST",
    attendees: 23,
    maxAttendees: 30,
    type: "study-group",
    tags: ["machine-learning", "python", "ai"],
  },
]

const mockMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=60&width=60",
    level: 15,
    xp: 15420,
    specialization: "Frontend Development",
    joinDate: "2023-06-15",
    coursesCompleted: 12,
    badges: ["React Master", "CSS Expert", "JavaScript Pro"],
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=60&width=60",
    level: 12,
    xp: 12180,
    specialization: "Data Science",
    joinDate: "2023-08-22",
    coursesCompleted: 8,
    badges: ["Python Expert", "Data Analyst", "ML Enthusiast"],
  },
]

// @route   GET /api/community/feed
// @desc    Get community feed posts
// @access  Public
router.get("/feed", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, tags } = req.query

    let filteredPosts = [...mockPosts]

    // Filter by type
    if (type && type !== "all") {
      filteredPosts = filteredPosts.filter((post) => post.type === type)
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(",")
      filteredPosts = filteredPosts.filter((post) => post.tags.some((tag) => tagArray.includes(tag)))
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + Number.parseInt(limit)
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

    res.json({
      success: true,
      posts: paginatedPosts,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(filteredPosts.length / limit),
        total: filteredPosts.length,
      },
    })
  } catch (error) {
    console.error("Get community feed error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/community/posts
// @desc    Create new community post
// @access  Private
router.post(
  "/posts",
  [
    auth,
    body("content").trim().isLength({ min: 10, max: 1000 }),
    body("type").isIn(["discussion", "question", "achievement", "tip"]),
    body("tags").optional().isArray(),
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

      const { content, type, tags = [] } = req.body

      const newPost = {
        id: Date.now().toString(),
        author: {
          id: req.user._id,
          name: req.user.fullName,
          avatar: req.user.avatar,
          level: req.user.level,
        },
        content,
        type,
        tags,
        timestamp: "Just now",
        likes: 0,
        comments: 0,
      }

      // In a real app, save to database
      mockPosts.unshift(newPost)

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: newPost,
      })
    } catch (error) {
      console.error("Create post error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/community/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post("/posts/:id/like", auth, async (req, res) => {
  try {
    const postId = req.params.id
    const post = mockPosts.find((p) => p.id === postId)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Toggle like (simplified - in real app, track user likes)
    post.likes += 1

    res.json({
      success: true,
      message: "Post liked successfully",
      likes: post.likes,
    })
  } catch (error) {
    console.error("Like post error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/community/events
// @desc    Get community events
// @access  Public
router.get("/events", optionalAuth, async (req, res) => {
  try {
    const { upcoming = true, type } = req.query

    let filteredEvents = [...mockEvents]

    // Filter by type
    if (type && type !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.type === type)
    }

    // Filter upcoming events
    if (upcoming === "true") {
      const today = new Date()
      filteredEvents = filteredEvents.filter((event) => new Date(event.date) >= today)
    }

    res.json({
      success: true,
      events: filteredEvents,
    })
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/community/events/:id/join
// @desc    Join an event
// @access  Private
router.post("/events/:id/join", auth, async (req, res) => {
  try {
    const eventId = req.params.id
    const event = mockEvents.find((e) => e.id === eventId)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    if (event.attendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      })
    }

    event.attendees += 1

    res.json({
      success: true,
      message: "Successfully joined event",
      event,
    })
  } catch (error) {
    console.error("Join event error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/community/members
// @desc    Get community members
// @access  Public
router.get("/members", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, search, specialization } = req.query

    let filteredMembers = [...mockMembers]

    // Search by name
    if (search) {
      filteredMembers = filteredMembers.filter((member) => member.name.toLowerCase().includes(search.toLowerCase()))
    }

    // Filter by specialization
    if (specialization && specialization !== "all") {
      filteredMembers = filteredMembers.filter((member) => member.specialization === specialization)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + Number.parseInt(limit)
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

    res.json({
      success: true,
      members: paginatedMembers,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(filteredMembers.length / limit),
        total: filteredMembers.length,
      },
    })
  } catch (error) {
    console.error("Get members error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/community/discussions
// @desc    Get discussion forums
// @access  Public
router.get("/discussions", optionalAuth, async (req, res) => {
  try {
    const discussions = [
      {
        id: "1",
        title: "General Discussion",
        description: "General topics and conversations",
        posts: 156,
        lastActivity: "2 hours ago",
        category: "general",
      },
      {
        id: "2",
        title: "Course Help",
        description: "Get help with courses and assignments",
        posts: 89,
        lastActivity: "1 hour ago",
        category: "help",
      },
      {
        id: "3",
        title: "Project Showcase",
        description: "Share your projects and get feedback",
        posts: 67,
        lastActivity: "3 hours ago",
        category: "showcase",
      },
      {
        id: "4",
        title: "Career Advice",
        description: "Career guidance and job search tips",
        posts: 134,
        lastActivity: "4 hours ago",
        category: "career",
      },
    ]

    res.json({
      success: true,
      discussions,
    })
  } catch (error) {
    console.error("Get discussions error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/community/stats
// @desc    Get community statistics
// @access  Public
router.get("/stats", async (req, res) => {
  try {
    const stats = {
      totalMembers: 1247,
      activeToday: 89,
      totalPosts: 3456,
      totalEvents: 23,
      upcomingEvents: 5,
      onlineNow: 34,
    }

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Get community stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
