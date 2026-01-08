const mongoose = require("mongoose")

/* ===========================
   Lesson Schema
   =========================== */
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true, // minutes
  },
  resources: [
    {
      title: String,
      url: String,
      type: {
        type: String,
        enum: ["pdf", "link", "code", "quiz"],
      },
    },
  ],
  order: {
    type: Number,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
})

/* ===========================
   Section Schema
   =========================== */
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  lessons: [lessonSchema],
  order: {
    type: Number,
    required: true,
  },
})

/* ===========================
   Review Schema
   =========================== */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
)

/* ===========================
   Course Schema
   =========================== */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    thumbnail: {
      type: String,
      default: "/placeholder.svg?height=200&width=300&text=Course",
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Machine Learning",
        "DevOps",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Language",
        "Other",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    duration: {
      type: Number, // hours (marketing)
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    tags: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    whatYouWillLearn: [{ type: String, trim: true }],
    curriculum: [sectionSchema],
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [reviewSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

/* ===========================
   SAFE VIRTUALS
   =========================== */

// Total lessons (defensive)
courseSchema.virtual("totalLessons").get(function () {
  if (!Array.isArray(this.curriculum)) return 0

  return this.curriculum.reduce((total, section) => {
    if (!Array.isArray(section.lessons)) return total
    return total + section.lessons.length
  }, 0)
})

// Total duration in minutes (defensive)
courseSchema.virtual("totalDurationMinutes").get(function () {
  if (!Array.isArray(this.curriculum)) return 0

  return this.curriculum.reduce((total, section) => {
    if (!Array.isArray(section.lessons)) return total

    return (
      total +
      section.lessons.reduce(
        (sectionTotal, lesson) =>
          sectionTotal + (lesson.duration || 0),
        0
      )
    )
  }, 0)
})

// Review count
courseSchema.virtual("reviewCount").get(function () {
  return Array.isArray(this.reviews) ? this.reviews.length : 0
})

// Discount percentage
courseSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    )
  }
  return 0
})

/* ===========================
   Indexes
   =========================== */
courseSchema.index({ title: "text", description: "text", tags: "text" })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ averageRating: -1, studentsEnrolled: -1 })
courseSchema.index({ instructor: 1 })
courseSchema.index({ isPublished: 1, featured: -1 })

/* ===========================
   Middleware
   =========================== */
courseSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date()
  }
  next()
})

/* ===========================
   Methods
   =========================== */
courseSchema.methods.calculateAverageRating = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0
  } else {
    const sum = this.reviews.reduce(
      (total, review) => total + review.rating,
      0
    )
    this.averageRating =
      Math.round((sum / this.reviews.length) * 10) / 10
  }
  return this.averageRating
}

/* ===========================
   Statics
   =========================== */
courseSchema.statics.getPopularCourses = function (limit = 10) {
  return this.find({ isPublished: true })
    .sort({ studentsEnrolled: -1, averageRating: -1 })
    .limit(limit)
    .populate("instructor", "firstName lastName avatar")
}

courseSchema.statics.getFeaturedCourses = function (limit = 6) {
  return this.find({ isPublished: true, featured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("instructor", "firstName lastName avatar")
}

module.exports = mongoose.model("Course", courseSchema)
