const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Course = require("../models/Course")
require("dotenv").config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

const createUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({})
    console.log("🗑️  Cleared existing users")

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@fusionbridge.com",
      password: "admin123",
      role: "admin",
      isVerified: true,
      xp: 10000,
      level: 50,
    })

    // Create instructor user
    const instructorUser = new User({
      firstName: "John",
      lastName: "Instructor",
      email: "instructor@fusionbridge.com",
      password: "instructor123",
      role: "instructor",
      isVerified: true,
      bio: "Experienced full-stack developer with 10+ years in the industry",
      xp: 5000,
      level: 25,
      skills: [
        { name: "JavaScript", level: 5, verified: true },
        { name: "React", level: 5, verified: true },
        { name: "Node.js", level: 4, verified: true },
        { name: "Python", level: 4, verified: true },
      ],
    })

    // Create student user
    const studentUser = new User({
      firstName: "Jane",
      lastName: "Student",
      email: "student@fusionbridge.com",
      password: "student123",
      role: "student",
      isVerified: true,
      bio: "Passionate learner interested in web development",
      xp: 1500,
      level: 8,
      skills: [
        { name: "HTML", level: 4, verified: false },
        { name: "CSS", level: 3, verified: false },
        { name: "JavaScript", level: 2, verified: false },
      ],
    })

    await Promise.all([adminUser.save(), instructorUser.save(), studentUser.save()])

    console.log("👥 Created test users:")
    console.log("   Admin: admin@fusionbridge.com / admin123")
    console.log("   Instructor: instructor@fusionbridge.com / instructor123")
    console.log("   Student: student@fusionbridge.com / student123")

    return { adminUser, instructorUser, studentUser }
  } catch (error) {
    console.error("❌ Error creating users:", error)
    throw error
  }
}

const createCourses = async (instructorId) => {
  try {
    // Clear existing courses
    await Course.deleteMany({})
    console.log("🗑️  Cleared existing courses")

    const courses = [
      {
        title: "Complete React Developer Course",
        description:
          "Master React from basics to advanced concepts including hooks, context, and modern patterns. Build real-world projects and learn industry best practices.",
        shortDescription: "Master React from basics to advanced concepts with real-world projects",
        category: "Web Development",
        level: "intermediate",
        price: 89.99,
        originalPrice: 129.99,
        duration: 40,
        instructor: instructorId,
        tags: ["react", "javascript", "frontend", "hooks", "jsx"],
        requirements: [
          "Basic knowledge of HTML, CSS, and JavaScript",
          "Understanding of ES6+ features",
          "Node.js installed on your computer",
        ],
        whatYouWillLearn: [
          "Build modern React applications from scratch",
          "Master React hooks and state management",
          "Implement routing with React Router",
          "Work with APIs and handle async operations",
          "Deploy React applications to production",
        ],
        curriculum: [
          {
            title: "Getting Started with React",
            description: "Introduction to React and setting up your development environment",
            order: 1,
            lessons: [
              {
                title: "What is React?",
                description: "Understanding React and its ecosystem",
                videoUrl: "https://example.com/video1",
                duration: 15,
                order: 1,
                isPreview: true,
              },
              {
                title: "Setting up Development Environment",
                description: "Installing Node.js, npm, and creating your first React app",
                videoUrl: "https://example.com/video2",
                duration: 20,
                order: 2,
                isPreview: true,
              },
            ],
          },
          {
            title: "React Fundamentals",
            description: "Core concepts of React including components, props, and state",
            order: 2,
            lessons: [
              {
                title: "Components and JSX",
                description: "Understanding React components and JSX syntax",
                videoUrl: "https://example.com/video3",
                duration: 25,
                order: 1,
              },
              {
                title: "Props and State",
                description: "Managing component data with props and state",
                videoUrl: "https://example.com/video4",
                duration: 30,
                order: 2,
              },
            ],
          },
        ],
        isPublished: true,
        featured: true,
        studentsEnrolled: 234,
        averageRating: 4.8,
        reviews: [
          {
            user: instructorId, // Using instructor as reviewer for demo
            rating: 5,
            comment: "Excellent course! Very comprehensive and well-structured.",
          },
        ],
      },
      {
        title: "Node.js Backend Development",
        description:
          "Learn to build scalable backend applications with Node.js, Express, and MongoDB. Cover authentication, APIs, and deployment.",
        shortDescription: "Build scalable backend applications with Node.js and Express",
        category: "Web Development",
        level: "intermediate",
        price: 79.99,
        originalPrice: 99.99,
        duration: 35,
        instructor: instructorId,
        tags: ["nodejs", "express", "mongodb", "backend", "api"],
        requirements: [
          "Basic JavaScript knowledge",
          "Understanding of web development concepts",
          "Node.js installed on your computer",
        ],
        whatYouWillLearn: [
          "Build RESTful APIs with Express.js",
          "Work with MongoDB and Mongoose",
          "Implement user authentication and authorization",
          "Handle file uploads and email sending",
          "Deploy applications to cloud platforms",
        ],
        curriculum: [
          {
            title: "Node.js Fundamentals",
            description: "Getting started with Node.js and understanding its core concepts",
            order: 1,
            lessons: [
              {
                title: "Introduction to Node.js",
                description: "What is Node.js and why use it for backend development",
                videoUrl: "https://example.com/video5",
                duration: 18,
                order: 1,
                isPreview: true,
              },
            ],
          },
        ],
        isPublished: true,
        featured: false,
        studentsEnrolled: 156,
        averageRating: 4.6,
      },
      {
        title: "Python for Data Science",
        description:
          "Complete guide to data science with Python. Learn pandas, numpy, matplotlib, and machine learning basics.",
        shortDescription: "Complete guide to data science with Python and popular libraries",
        category: "Data Science",
        level: "beginner",
        price: 69.99,
        duration: 45,
        instructor: instructorId,
        tags: ["python", "data-science", "pandas", "numpy", "matplotlib"],
        requirements: ["Basic programming knowledge", "Python installed on your computer", "Interest in data analysis"],
        whatYouWillLearn: [
          "Master Python for data analysis",
          "Work with pandas and numpy libraries",
          "Create visualizations with matplotlib",
          "Perform statistical analysis",
          "Build basic machine learning models",
        ],
        curriculum: [
          {
            title: "Python Basics for Data Science",
            description: "Essential Python concepts for data science",
            order: 1,
            lessons: [
              {
                title: "Python Data Types and Structures",
                description: "Understanding lists, dictionaries, and data structures",
                videoUrl: "https://example.com/video6",
                duration: 22,
                order: 1,
                isPreview: true,
              },
            ],
          },
        ],
        isPublished: true,
        featured: true,
        studentsEnrolled: 189,
        averageRating: 4.7,
      },
    ]

    const createdCourses = await Course.insertMany(courses)
    console.log(`📚 Created ${createdCourses.length} sample courses`)

    return createdCourses
  } catch (error) {
    console.error("❌ Error creating courses:", error)
    throw error
  }
}

const setupDatabase = async () => {
  try {
    console.log("🚀 Starting database setup...")

    await connectDB()

    const { instructorUser, studentUser } = await createUsers()
    const courses = await createCourses(instructorUser._id)

    // Enroll student in some courses
    studentUser.enrolledCourses.push(
      {
        course: courses[0]._id,
        enrolledAt: new Date(),
        progress: 45,
      },
      {
        course: courses[2]._id,
        enrolledAt: new Date(),
        progress: 20,
      },
    )

    await studentUser.save()
    console.log("📝 Enrolled student in sample courses")

    console.log("✅ Database setup completed successfully!")
    console.log("\n🎯 You can now:")
    console.log("   1. Start the server: npm run dev")
    console.log("   2. Test the API endpoints")
    console.log("   3. Login with the test accounts")

    process.exit(0)
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase, createUsers, createCourses }
