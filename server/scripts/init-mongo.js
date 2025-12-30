// MongoDB initialization script for Docker
const db = db.getSiblingDB("fusionbridge")

// Create collections
db.createCollection("users")
db.createCollection("courses")
db.createCollection("posts")
db.createCollection("projects")
db.createCollection("events")

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.courses.createIndex({ title: "text", description: "text" })
db.posts.createIndex({ createdAt: -1 })
db.posts.createIndex({ author: 1 })
db.projects.createIndex({ freelancer: 1 })
db.projects.createIndex({ status: 1 })
db.events.createIndex({ date: 1 })

// Create admin user
db.users.insertOne({
  username: "admin",
  email: "admin@fusionbridge.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6L7Q1/2", // password: admin123
  role: "admin",
  profile: {
    firstName: "Admin",
    lastName: "User",
    bio: "System Administrator",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
})

print("Database initialized successfully!")
