const express = require('express')
const { auth, authorize } = require('../middleware/auth')
const {
  geminiRateLimit,
  checkGeminiRateLimit,
  getRateLimitStatus,
} = require('../middleware/geminiRateLimit')
const { getGeminiService } = require('../services/gemini.service')
const {
  AIGeneratedQuiz,
  AIChatHistory,
  AICodeReview,
  AILearningPath,
  AISummary,
  AIGeneratedCourse,
  AIRecommendations,
} = require('../models/AI')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const { ApiResponse } = require('../utils/apiResponse')
const logger = require('../utils/logger')

const router = express.Router()
let geminiService = null

const getGeminiServiceInstance = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null
  }

  if (!geminiService) {
    try {
      geminiService = getGeminiService()
    } catch (error) {
      logger.error('Failed to initialize Gemini service:', error)
      return null
    }
  }

  return geminiService
}

const requireGeminiService = (res) => {
  const service = getGeminiServiceInstance()

  if (!service) {
    res.status(503).json(
      new ApiResponse(503, null, 'Gemini AI is not configured. Set GEMINI_API_KEY to enable AI endpoints.')
    )
    return null
  }

  return service
}

/**
 * Error handler wrapper for async routes
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const findEmbeddedLesson = (course, lessonId) => {
  for (const section of course?.curriculum || []) {
    for (const lesson of section.lessons || []) {
      if (lesson?._id?.toString() === lessonId.toString()) {
        return { lesson, sectionTitle: section.title }
      }
    }
  }

  return null
}

const buildLessonContent = ({ courseTitle, lesson, sectionTitle }) => {
  const resources = Array.isArray(lesson?.resources) && lesson.resources.length > 0
    ? lesson.resources
        .map((resource) => `${resource.title || 'Resource'}${resource.url ? `: ${resource.url}` : ''}`)
        .join('\n')
    : ''

  return [
    courseTitle ? `Course: ${courseTitle}` : null,
    sectionTitle ? `Section: ${sectionTitle}` : null,
    lesson?.title ? `Lesson: ${lesson.title}` : null,
    lesson?.description ? `Description: ${lesson.description}` : null,
    lesson?.content ? `Content: ${lesson.content}` : null,
    resources ? `Resources:\n${resources}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')
}

const resolveLessonContext = async ({ courseId, lessonId }) => {
  const lessonDoc = await Lesson.findById(lessonId).lean()

  if (lessonDoc) {
    const course = lessonDoc.course ? await Course.findById(lessonDoc.course).select('title').lean() : null

    return {
      courseTitle: course?.title,
      lesson: lessonDoc,
      lessonTitle: lessonDoc.title,
      lessonContent: lessonDoc.content || buildLessonContent({
        courseTitle: course?.title,
        lesson: lessonDoc,
      }),
    }
  }

  const course = await Course.findById(courseId).select('title curriculum').lean()

  if (!course) {
    return null
  }

  const embedded = findEmbeddedLesson(course, lessonId)

  if (!embedded) {
    return null
  }

  return {
    courseTitle: course.title,
    lesson: embedded.lesson,
    lessonTitle: embedded.lesson.title,
    lessonContent: buildLessonContent({
      courseTitle: course.title,
      lesson: embedded.lesson,
      sectionTitle: embedded.sectionTitle,
    }),
  }
}

/* ===========================
   QUIZ GENERATION
   =========================== */

/**
 * POST /api/ai/quizzes/generate
 * Generate quiz questions from lesson content
 */
router.post(
  '/quizzes/generate',
  auth,
  geminiRateLimit,
  authorize(['instructor']),
  asyncHandler(async (req, res) => {
    const { courseId, lessonId, questionCount = 10, difficulty = 'intermediate', questionTypes = ['mcq'] } = req.body

    // Validate inputs
    if (!courseId || !lessonId) {
      return res.status(400).json(new ApiResponse(400, null, 'courseId and lessonId required'))
    }

    if (questionCount < 5 || questionCount > 50) {
      return res.status(400).json(new ApiResponse(400, null, 'questionCount must be between 5 and 50'))
    }

    try {
      const geminiService = requireGeminiService(res)
      if (!geminiService) {
        return
      }

      // Check rate limit
      await checkGeminiRateLimit(req.user._id, req.user.subscription === 'premium')

      const lessonContext = await resolveLessonContext({ courseId, lessonId })

      if (!lessonContext) {
        return res.status(404).json(new ApiResponse(404, null, 'Lesson not found'))
      }

      logger.info(`📚 Generating quiz for lesson: ${lessonContext.lessonTitle}`)

      // Call Gemini to generate quiz
      const quizData = await geminiService.generateQuiz(lessonContext.lessonContent, {
        questionCount,
        difficulty,
        questionTypes,
        topic: lessonContext.lessonTitle,
      })

      // Save quiz to database
      const quiz = new AIGeneratedQuiz({
        courseId,
        lessonId,
        questions: quizData.questions,
        metadata: quizData.metadata,
        generatedBy: 'gemini-1.5-flash',
        instructor: {
          id: req.user._id,
        },
        status: 'draft',
      })

      await quiz.save()

      logger.info(`✅ Quiz generated and saved: ${quiz._id}`)

      res.status(201).json(
        new ApiResponse(201, {
          quizId: quiz._id,
          questions: quiz.questions,
          metadata: quiz.metadata,
          status: quiz.status,
          message: 'Review and customize before publishing',
        }, 'Quiz generated successfully')
      )
    } catch (error) {
      logger.error('Quiz generation error:', error)
      res.status(500).json(new ApiResponse(500, null, `Quiz generation failed: ${error.message}`))
    }
  })
)

/**
 * GET /api/ai/quizzes/:quizId
 * Retrieve generated quiz
 */
router.get('/quizzes/:quizId', auth, asyncHandler(async (req, res) => {
  const quiz = await AIGeneratedQuiz.findById(req.params.quizId)
  
  if (!quiz) {
    return res.status(404).json(new ApiResponse(404, null, 'Quiz not found'))
  }

  res.status(200).json(new ApiResponse(200, quiz, 'Quiz retrieved successfully'))
}))

/**
 * PUT /api/ai/quizzes/:quizId/approve
 * Approve and publish quiz
 */
router.put(
  '/quizzes/:quizId/approve',
  auth,
  authorize(['instructor']),
  asyncHandler(async (req, res) => {
    const quiz = await AIGeneratedQuiz.findById(req.params.quizId)
    
    if (!quiz) {
      return res.status(404).json(new ApiResponse(404, null, 'Quiz not found'))
    }

    // Check ownership
    if (quiz.instructor.id.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Not authorized to approve this quiz'))
    }

    quiz.status = 'approved'
    quiz.isPublished = true
    quiz.instructor.reviewed = true
    quiz.instructor.approvedAt = new Date()

    await quiz.save()

    logger.info(`✅ Quiz approved and published: ${quiz._id}`)

    res.status(200).json(
      new ApiResponse(200, { quizId: quiz._id, status: quiz.status }, 'Quiz approved successfully')
    )
  })
)

/* ===========================
   Q&A CHATBOT
   =========================== */

/**
 * POST /api/ai/chat/ask
 * Ask question and get answer from Gemini
 */
router.post(
  '/chat/ask',
  auth,
  geminiRateLimit,
  asyncHandler(async (req, res) => {
    const { courseId, lessonId, message, conversationId } = req.body

    if (!courseId || !message) {
      return res.status(400).json(new ApiResponse(400, null, 'courseId and message required'))
    }

    try {
      const geminiService = requireGeminiService(res)
      if (!geminiService) {
        return
      }

      // Check rate limit
      await checkGeminiRateLimit(req.user._id, req.user.subscription === 'premium')

      // Fetch course and lesson for context
      const course = await Course.findById(courseId).select('title')
      const lessonContext = lessonId ? await resolveLessonContext({ courseId, lessonId }) : null

      if (!course) {
        return res.status(404).json(new ApiResponse(404, null, 'Course not found'))
      }

      logger.info(`💬 Processing Q&A from user: ${req.user._id}`)

      // Get conversation history if exists
      let chatHistory = null
      if (conversationId) {
        chatHistory = await AIChatHistory.findById(conversationId)
      }

      // Prepare context
      const contextData = {
        courseTitle: course.title,
        lessonTitle: lessonContext?.lessonTitle || 'General',
        studentLevel: req.user.skillLevel || 'intermediate',
        previousQuestions: chatHistory?.messages || [],
      }

      // Get answer from Gemini
      const answer = await geminiService.answerQuestion(message, contextData)

      // Save or update chat history
      if (chatHistory) {
        chatHistory.messages.push(
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: answer.answer, timestamp: new Date() }
        )
        chatHistory.totalMessages = chatHistory.messages.length
        await chatHistory.save()
      } else {
        chatHistory = new AIChatHistory({
          userId: req.user._id,
          courseId,
          lessonId,
          conversationId: require('crypto').randomUUID(),
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: answer.answer, timestamp: new Date() },
          ],
          totalMessages: 2,
        })
        await chatHistory.save()
      }

      logger.info(`✅ Q&A response generated for conversation: ${chatHistory._id}`)

      res.status(200).json(
        new ApiResponse(200, {
          conversationId: chatHistory._id,
          answer: answer.answer,
          codeExample: answer.codeExample,
          relatedTopics: answer.relatedTopics,
          followUpQuestion: answer.followUpQuestion,
          confidence: answer.confidence,
        }, 'Answer generated successfully')
      )
    } catch (error) {
      logger.error('Q&A error:', error)
      res.status(500).json(new ApiResponse(500, null, `Q&A failed: ${error.message}`))
    }
  })
)

/**
 * GET /api/ai/chat/history/:conversationId
 * Get chat history
 */
router.get('/chat/history/:conversationId', auth, asyncHandler(async (req, res) => {
  const chat = await AIChatHistory.findById(req.params.conversationId)
  
  if (!chat) {
    return res.status(404).json(new ApiResponse(404, null, 'Conversation not found'))
  }

  // Check ownership
  if (chat.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json(new ApiResponse(403, null, 'Not authorized to view this conversation'))
  }

  res.status(200).json(new ApiResponse(200, chat, 'Conversation history retrieved'))
}))

/* ===========================
   LESSON SUMMARIZATION
   =========================== */

/**
 * POST /api/ai/lessons/summarize
 * Generate lesson summary and key concepts
 */
router.post(
  '/lessons/summarize',
  auth,
  geminiRateLimit,
  asyncHandler(async (req, res) => {
    const { courseId, lessonId, length = 'medium' } = req.body

    if (!courseId || !lessonId) {
      return res.status(400).json(new ApiResponse(400, null, 'courseId and lessonId required'))
    }

    try {
      const geminiService = requireGeminiService(res)
      if (!geminiService) {
        return
      }

      // Check rate limit
      await checkGeminiRateLimit(req.user._id, req.user.subscription === 'premium')

      const lessonContext = await resolveLessonContext({ courseId, lessonId })

      if (!lessonContext) {
        return res.status(404).json(new ApiResponse(404, null, 'Lesson not found'))
      }

      logger.info(`📝 Summarizing lesson: ${lessonContext.lessonTitle}`)

      // Call Gemini to generate summary
      const summary = await geminiService.summarizeLesson(lessonContext.lessonContent, {
        length,
        format: 'markdown',
      })

      // Save summary to database
      const savedSummary = new AISummary({
        courseId,
        lessonId,
        length,
        format: 'markdown',
        summary: summary.summary,
        keyPoints: summary.keyPoints,
        definitions: summary.definitions,
        codeSnippets: summary.codeSnippets,
        studyTips: summary.studyTips,
        commonMistakes: summary.commonMistakes,
        relatedConcepts: summary.relatedConcepts,
        estimatedReadTime: summary.estimatedReadTime,
      })

      await savedSummary.save()

      logger.info(`✅ Summary generated: ${savedSummary._id}`)

      res.status(201).json(
        new ApiResponse(201, {
          summaryId: savedSummary._id,
          ...summary,
        }, 'Summary generated successfully')
      )
    } catch (error) {
      logger.error('Summarization error:', error)
      res.status(500).json(new ApiResponse(500, null, `Summarization failed: ${error.message}`))
    }
  })
)

/**
 * GET /api/ai/lessons/:lessonId/summary
 * Get lesson summary
 */
router.get('/lessons/:lessonId/summary', auth, asyncHandler(async (req, res) => {
  const summary = await AISummary.findOne({ lessonId: req.params.lessonId })
  
  if (!summary) {
    return res.status(404).json(new ApiResponse(404, null, 'Summary not found'))
  }

  res.status(200).json(new ApiResponse(200, summary, 'Summary retrieved successfully'))
}))

/* ===========================
   CODE REVIEW
   =========================== */

/**
 * POST /api/ai/code/review
 * Review student code submission
 */
router.post(
  '/code/review',
  auth,
  geminiRateLimit,
  asyncHandler(async (req, res) => {
    const { courseId, lessonId, code, language = 'javascript', requirements } = req.body

    if (!courseId || !lessonId || !code) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'courseId, lessonId, and code required'))
    }

    if (code.length > 10000) {
      return res.status(400).json(new ApiResponse(400, null, 'Code too large (max 10000 chars)'))
    }

    try {
      const geminiService = requireGeminiService(res)
      if (!geminiService) {
        return
      }

      // Check rate limit
      await checkGeminiRateLimit(req.user._id, req.user.subscription === 'premium')

      logger.info(`🔍 Reviewing code for user: ${req.user._id}`)

      // Call Gemini for code review
      const review = await geminiService.reviewCode(code, {
        language,
        requirements,
      })

      // Save review to database
      const codeReview = new AICodeReview({
        userId: req.user._id,
        courseId,
        lessonId,
        submission: {
          code,
          language,
        },
        feedback: review,
      })

      await codeReview.save()

      logger.info(`✅ Code review completed: ${codeReview._id}`)

      res.status(201).json(
        new ApiResponse(201, {
          reviewId: codeReview._id,
          score: review.score,
          issues: review.issues,
          strengths: review.strengths,
          improvements: review.improvements,
        }, 'Code review completed successfully')
      )
    } catch (error) {
      logger.error('Code review error:', error)
      res.status(500).json(new ApiResponse(500, null, `Code review failed: ${error.message}`))
    }
  })
)

/* ===========================
   LEARNING PATHS
   =========================== */

/**
 * POST /api/ai/learning-paths/generate
 * Generate personalized learning path
 */
router.post(
  '/learning-paths/generate',
  auth,
  geminiRateLimit,
  asyncHandler(async (req, res) => {
    const { courseId, outline, skillLevel = 'beginner', timePerWeek = 10 } = req.body

    if (!courseId || !outline) {
      return res.status(400).json(new ApiResponse(400, null, 'courseId and outline required'))
    }

    try {
      const geminiService = requireGeminiService(res)
      if (!geminiService) {
        return
      }

      // Check rate limit
      await checkGeminiRateLimit(req.user._id, req.user.subscription === 'premium')

      logger.info(`🗺️ Generating learning path for user: ${req.user._id}`)

      // Call Gemini to generate learning path
      const pathData = await geminiService.generateLearningPath(outline, {
        skillLevel,
        timePerWeek,
        goal: req.body.goal,
        learningStyle: req.body.learningStyle || 'mixed',
      })

      // Save learning path to database
      const learningPath = new AILearningPath({
        userId: req.user._id,
        courseId,
        pathName: `${skillLevel} Learning Path - Week ${pathData.weeks.length}`,
        weeks: pathData.weeks,
        totalDuration: pathData.totalDuration,
        totalHours: pathData.totalHours,
        prerequisiteSkills: pathData.prerequisiteSkills,
        keySkillsGained: pathData.keySkillsGained,
        studentProgress: {
          currentWeek: 1,
          completedWeeks: [],
          overallProgress: 0,
        },
      })

      await learningPath.save()

      logger.info(`✅ Learning path generated: ${learningPath._id}`)

      res.status(201).json(
        new ApiResponse(201, {
          pathId: learningPath._id,
          weeks: pathData.weeks,
          totalDuration: pathData.totalDuration,
        }, 'Learning path generated successfully')
      )
    } catch (error) {
      logger.error('Learning path generation error:', error)
      res.status(500).json(new ApiResponse(500, null, `Learning path generation failed: ${error.message}`))
    }
  })
)

/* ===========================
   RATE LIMIT STATUS
   =========================== */

/**
 * GET /api/ai/rate-limit/status
 * Get current rate limit status
 */
router.get('/rate-limit/status', auth, (req, res) => {
  const status = getRateLimitStatus(req.user._id, req.user.subscription === 'premium')

  res.status(200).json(
    new ApiResponse(200, status, 'Rate limit status retrieved successfully')
  )
})

/* ===========================
   COST STATISTICS
   =========================== */

/**
 * GET /api/ai/costs/stats
 * Get API cost statistics (admin only)
 */
router.get('/costs/stats', auth, authorize(['admin']), (req, res) => {
  const stats = geminiService.getCostStats()

  res.status(200).json(
    new ApiResponse(200, stats, 'Cost statistics retrieved successfully')
  )
})

module.exports = router
