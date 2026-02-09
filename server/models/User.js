const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150x150?text=User",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+\..+/, "Please enter a valid website URL"],
    },
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      portfolio: String,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    coursesCompleted: {
      type: Number,
      default: 0,
    },
    totalLearningHours: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        name: String,
        level: {
          type: Number,
          min: 1,
          max: 5,
          default: 1,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      learningReminders: {
        type: Boolean,
        default: true,
      },
      communityUpdates: {
        type: Boolean,
        default: true,
      },
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    enrolledCourses: [
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    isCourseCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    certificateUnlocked: {
      type: Boolean,
      default: false
    },

    lessonAccessHistory: [
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    accessCount: {
      type: Number,
      default: 1,
    },
  },
],

  }
],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for progress to next level
userSchema.virtual("progressToNextLevel").get(function () {
  const xpForNextLevel = this.level * 1000
  const xpForCurrentLevel = (this.level - 1) * 1000
  const currentLevelXp = this.xp - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  return Math.round((currentLevelXp / xpNeededForLevel) * 100)
})

// Index for better performance
userSchema.index({ email: 1 })
userSchema.index({ level: -1, xp: -1 })

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Update level based on XP
userSchema.pre("save", function (next) {
  const newLevel = Math.floor(this.xp / 1000) + 1
  if (newLevel > this.level) {
    this.level = newLevel
  }
  next()
})

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  )
}

// Method to update XP
userSchema.methods.addXP = function (points) {
  this.xp += points
  return this.save()
}

module.exports = mongoose.model("User", userSchema)
