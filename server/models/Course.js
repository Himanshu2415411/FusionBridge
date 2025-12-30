const mongoose = require("mongoose")

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
    type: Number, // in minutes
    required: true,
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
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
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
      required: [true, "Course category is required"],
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
      required: [true, "Course level is required"],
      enum: ["beginner", "intermediate", "advanced"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    whatYouWillLearn: [
      {
        type: String,
        trim: true,
      },
    ],
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
  },
)

// Virtual for total lessons count
courseSchema.virtual("totalLessons").get(function () {
  return this.curriculum.reduce((total, section) => total + section.lessons.length, 0)
})

// Virtual for total duration in minutes
courseSchema.virtual("totalDurationMinutes").get(function () {
  return this.curriculum.reduce(
    (total, section) => total + section.lessons.reduce((sectionTotal, lesson) => sectionTotal + lesson.duration, 0),
    0,
  )
})

// Virtual for review count
courseSchema.virtual("reviewCount").get(function () {
  return this.reviews.length
})

// Virtual for discount percentage
courseSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Index for better search performance
courseSchema.index({ title: "text", description: "text", tags: "text" })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ averageRating: -1, studentsEnrolled: -1 })
courseSchema.index({ instructor: 1 })
courseSchema.index({ isPublished: 1, featured: -1 })

// Pre-save middleware to update lastUpdated
courseSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date()
  }
  next()
})

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0
  } else {
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0)
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10
  }
  return this.averageRating
}

// Static method to get popular courses
courseSchema.statics.getPopularCourses = function (limit = 10) {
  return this.find({ isPublished: true })
    .sort({ studentsEnrolled: -1, averageRating: -1 })
    .limit(limit)
    .populate("instructor", "firstName lastName avatar")
}

// Static method to get featured courses
courseSchema.statics.getFeaturedCourses = function (limit = 6) {
  return this.find({ isPublished: true, featured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("instructor", "firstName lastName avatar")
}

module.exports = mongoose.model("Course", courseSchema)
