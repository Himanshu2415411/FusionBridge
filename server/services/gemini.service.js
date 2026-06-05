const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai')
const logger = require('../utils/logger')

/**
 * GeminiService - Main service for Gemini API interactions
 * Handles:
 * - API calls with retry logic
 * - Error handling and logging
 * - Cost tracking and monitoring
 * - Response caching
 * - Rate limiting
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    this.client = null
    this.model = null
    this.costTracker = {
      totalRequests: 0,
      totalTokensInput: 0,
      totalTokensOutput: 0,
      totalCost: 0,
      startDate: new Date(),
    }
    this.responseCache = new Map()
    this.cacheTTL = parseInt(process.env.GEMINI_CACHE_TTL_SECONDS) || 86400

    this._initialize()
  }

  /**
   * Initialize Gemini client
   */
  _initialize() {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables')
    }

    try {
      this.client = new GoogleGenerativeAI(this.apiKey)
      this.model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: this._getSystemInstruction(),
      })
      logger.info(`✅ Gemini Service initialized with model: ${this.modelName}`)
    } catch (error) {
      logger.error('Failed to initialize Gemini client:', error)
      throw error
    }
  }

  /**
   * Get system instruction for the model
   */
  _getSystemInstruction() {
    return `You are an expert online learning assistant for UniBridge platform. Your role is to:
1. Provide clear, concise explanations
2. Give practical code examples when relevant
3. Suggest related resources and follow-up learning
4. Adapt explanations to student level
5. Always respond in valid JSON format (unless explicitly told otherwise)
6. Include explanations for your reasoning
7. Flag complex topics that need instructor review

Guidelines:
- Be encouraging and supportive
- Promote critical thinking
- Avoid direct answers to homework without explanation
- Suggest students review course materials
- Keep responses focused and relevant`
  }

  /**
   * Generate quiz questions from lesson content
   */
  async generateQuiz(lessonContent, options = {}) {
    const {
      questionCount = 10,
      difficulty = 'intermediate',
      questionTypes = ['mcq', 'trueFalse'],
      topic = 'General',
      language = 'en',
    } = options

    const cacheKey = `quiz_${Buffer.from(lessonContent).toString('base64').substring(0, 50)}_${questionCount}_${difficulty}`

    // Check cache
    if (process.env.GEMINI_CACHE_ENABLED === 'true') {
      const cached = this._getFromCache(cacheKey)
      if (cached) {
        logger.info('✅ Returning cached quiz')
        return cached
      }
    }

    const prompt = `
Generate exactly ${questionCount} quiz questions from the following lesson content.
Topic: ${topic}
Difficulty Level: ${difficulty}
Question Types to Include: ${questionTypes.join(', ')}
Language: ${language}

Lesson Content:
${lessonContent}

Requirements:
1. Generate diverse, high-quality questions
2. Include 4 options for MCQ (labeled A, B, C, D)
3. Clearly mark correct answer
4. Include explanation for each answer
5. Ensure questions test understanding, not just memorization
6. Questions should be progressive in difficulty

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "type": "mcq",
      "options": ["A: option1", "B: option2", "C: option3", "D: option4"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "intermediate",
      "topic": "${topic}"
    }
  ],
  "metadata": {
    "totalQuestions": ${questionCount},
    "difficulty": "${difficulty}",
    "estimatedTimeMinutes": ${questionCount * 1.5},
    "generatedAt": "${new Date().toISOString()}"
  }
}
`

    try {
      const result = await this._callGeminiWithRetry(prompt)
      const parsedResult = this._parseJSONResponse(result)

      // Cache the result
      if (process.env.GEMINI_CACHE_ENABLED === 'true') {
        this._setCache(cacheKey, parsedResult)
      }

      return parsedResult
    } catch (error) {
      logger.error('Error generating quiz:', error)
      throw new Error(`Failed to generate quiz: ${error.message}`)
    }
  }

  /**
   * Generate lesson summary with key concepts
   */
  async summarizeLesson(lessonContent, options = {}) {
    const { length = 'medium', format = 'markdown' } = options

    const lengthGuide = {
      short: '2-3 paragraphs (150-200 words)',
      medium: '4-5 paragraphs (300-400 words)',
      long: '1-2 pages (500-800 words)',
    }

    const prompt = `
Summarize the following lesson content with key concepts, definitions, and main ideas.

Length: ${lengthGuide[length] || lengthGuide.medium}
Format: ${format}

Lesson Content:
${lessonContent}

Provide response in JSON format:
{
  "summary": "Main summary text",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "definitions": {
    "term1": "Clear definition",
    "term2": "Clear definition"
  },
  "codeSnippets": [
    {
      "title": "Example",
      "code": "code here",
      "explanation": "what it does"
    }
  ],
  "studyTips": ["Tip 1", "Tip 2", "Tip 3"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "relatedConcepts": ["Concept 1", "Concept 2"],
  "estimatedReadTime": 10
}
`

    try {
      const result = await this._callGeminiWithRetry(prompt)
      return this._parseJSONResponse(result)
    } catch (error) {
      logger.error('Error summarizing lesson:', error)
      throw new Error(`Failed to summarize lesson: ${error.message}`)
    }
  }

  /**
   * Answer student question with context
   */
  async answerQuestion(question, contextData = {}) {
    const {
      courseTitle = 'General Course',
      lessonTitle = 'Current Lesson',
      studentLevel = 'intermediate',
      previousQuestions = [],
    } = contextData

    const conversationContext = previousQuestions
      .slice(-3)
      .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
      .join('\n\n')

    const prompt = `
A student in the "${courseTitle}" course (${studentLevel} level) studying "${lessonTitle}" asks:

${conversationContext ? `Previous context:\n${conversationContext}\n\n` : ''}

NEW QUESTION: "${question}"

Provide a helpful, educational response that:
1. Explains the concept clearly for their level
2. Includes practical examples or code when relevant
3. Relates to the current lesson
4. Avoids giving direct homework answers
5. Suggests related concepts to explore
6. Asks a follow-up question to promote thinking

Return as JSON:
{
  "answer": "Detailed answer text",
  "codeExample": "if applicable, include code",
  "relatedTopics": ["Topic 1", "Topic 2"],
  "followUpQuestion": "Suggested follow-up question",
  "isHomeworkQuestion": false,
  "confidence": 0.95,
  "explanation": "Why this answer is correct"
}
`

    try {
      const result = await this._callGeminiWithRetry(prompt)
      return this._parseJSONResponse(result)
    } catch (error) {
      logger.error('Error answering question:', error)
      throw new Error(`Failed to answer question: ${error.message}`)
    }
  }

  /**
   * Review student code submission
   */
  async reviewCode(code, options = {}) {
    const {
      language = 'javascript',
      requirements = '',
      assignmentTitle = 'Code Assignment',
      studentLevel = 'intermediate',
    } = options

    const prompt = `
Review this ${language} code submission:

Assignment: ${assignmentTitle}
Student Level: ${studentLevel}
${requirements ? `Requirements: ${requirements}` : ''}

Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide constructive feedback in JSON format:
{
  "score": 75,
  "issues": [
    {
      "line": 5,
      "type": "bug|style|performance|logic",
      "severity": "low|medium|high",
      "description": "What's wrong",
      "suggestion": "How to fix it",
      "explanation": "Why this matters"
    }
  ],
  "strengths": ["What they did well"],
  "improvements": ["General improvements"],
  "bestPractices": ["Industry best practice"],
  "suggestedRefactoring": "Improved version of code",
  "learningResources": [
    {
      "title": "Resource",
      "topic": "What it covers"
    }
  ],
  "overallFeedback": "Summary of review"
}
`

    try {
      const result = await this._callGeminiWithRetry(prompt)
      return this._parseJSONResponse(result)
    } catch (error) {
      logger.error('Error reviewing code:', error)
      throw new Error(`Failed to review code: ${error.message}`)
    }
  }

  /**
   * Generate learning path from course outline
   */
  async generateLearningPath(courseOutline, options = {}) {
    const {
      skillLevel = 'beginner',
      goal = '',
      timePerWeek = 10,
      learningStyle = 'mixed',
    } = options

    const prompt = `
Create a detailed learning path for a ${skillLevel} student with ${timePerWeek} hours/week availability.

Course Topics: ${courseOutline.join(', ')}
Learning Goal: ${goal}
Learning Style: ${learningStyle} (visual, hands-on, theory, mixed)

Generate a 4-8 week learning path in JSON:
{
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week Title",
      "topics": ["Topic 1", "Topic 2"],
      "lessons": [
        {
          "title": "Lesson Title",
          "duration": "2 hours",
          "type": "theory|project|quiz",
          "description": "What to learn"
        }
      ],
      "project": {
        "title": "Build something",
        "description": "What to build",
        "difficulty": "beginner"
      },
      "estimatedHours": 10,
      "difficulty": "beginner"
    }
  ],
  "totalDuration": "4 weeks",
  "totalHours": 40,
  "prerequisiteSkills": [],
  "keySkillsGained": []
}
`

    try {
      const result = await this._callGeminiWithRetry(prompt)
      return this._parseJSONResponse(result)
    } catch (error) {
      logger.error('Error generating learning path:', error)
      throw new Error(`Failed to generate learning path: ${error.message}`)
    }
  }

  /**
   * Generate course from outline
   */
  async generateCourse(courseOutline, options = {}) {
    const {
      targetAudience = 'Beginners',
      duration = '4 weeks',
      language = 'English',
    } = options

    const prompt = `
Generate a comprehensive course structure from this outline:
${courseOutline.join('\n')}

Target Audience: ${targetAudience}
Duration: ${duration}
Language: ${language}

Return complete course structure as JSON:
{
  "courseTitle": "Engaging course title",
  "subtitle": "Brief subtitle",
  "description": "Detailed course description (200+ words)",
  "learningObjectives": [
    "What students will learn by completing this course (5-8 objectives)"
  ],
  "targetAudience": "${targetAudience}",
  "prerequisites": [],
  "estimatedDuration": "${duration}",
  "difficulty": "beginner",
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Module Title",
      "description": "Module overview",
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "Lesson Title",
          "description": "Lesson overview",
          "duration": "1 hour",
          "topics": ["Topic 1", "Topic 2"]
        }
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Build this",
      "skills": ["Skill 1", "Skill 2"]
    }
  ],
  "syllabus": "Full course outline"
}
`

    try {
      const result = await this._callGeminiWithRetry(prompt)
      return this._parseJSONResponse(result)
    } catch (error) {
      logger.error('Error generating course:', error)
      throw new Error(`Failed to generate course: ${error.message}`)
    }
  }

  /**
   * Call Gemini API with retry logic
   */
  async _callGeminiWithRetry(prompt, maxRetries = 3) {
    let lastError
    const baseDelay = 1000 // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`📤 Calling Gemini API (attempt ${attempt}/${maxRetries})`)

        const response = await this.model.generateContent(prompt)
        const text = response.response.text()

        // Track cost
        if (response.response.usageMetadata) {
          this._trackCost(response.response.usageMetadata)
        }

        logger.info(`✅ Gemini API response received`)
        return text
      } catch (error) {
        lastError = error
        logger.warn(`⚠️ Attempt ${attempt} failed:`, error.message)

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1)
          logger.info(`⏳ Retrying in ${delay}ms...`)
          await this._sleep(delay)
        }
      }
    }

    throw new Error(
      `Gemini API call failed after ${maxRetries} attempts: ${lastError?.message}`
    )
  }

  /**
   * Parse JSON response from Gemini
   */
  _parseJSONResponse(responseText) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      logger.error('Failed to parse JSON response:', error)
      throw new Error(`Invalid JSON response from Gemini: ${error.message}`)
    }
  }

  /**
   * Track API costs
   */
  _trackCost(usageMetadata) {
    const inputTokens = usageMetadata.promptTokenCount || 0
    const outputTokens = usageMetadata.candidateTokenCount || 0

    // Pricing for Gemini 1.5 Flash
    const inputCost = (inputTokens / 1000000) * 0.075
    const outputCost = (outputTokens / 1000000) * 0.3

    const totalCost = inputCost + outputCost

    this.costTracker.totalRequests++
    this.costTracker.totalTokensInput += inputTokens
    this.costTracker.totalTokensOutput += outputTokens
    this.costTracker.totalCost += totalCost

    if (process.env.GEMINI_COST_MONITORING_ENABLED === 'true') {
      logger.info(
        `💰 Cost tracked - Input: ${inputTokens} tokens ($${inputCost.toFixed(6)}), ` +
          `Output: ${outputTokens} tokens ($${outputCost.toFixed(6)}), ` +
          `Total: $${this.costTracker.totalCost.toFixed(6)}`
      )

      // Alert if cost exceeds threshold
      const threshold = parseFloat(process.env.GEMINI_COST_ALERT_THRESHOLD) || 100
      if (this.costTracker.totalCost > threshold) {
        logger.error(
          `🚨 COST ALERT: Total cost ($${this.costTracker.totalCost.toFixed(2)}) ` +
            `exceeds threshold ($${threshold})`
        )
      }
    }
  }

  /**
   * Get cost statistics
   */
  getCostStats() {
    return {
      totalRequests: this.costTracker.totalRequests,
      totalTokensInput: this.costTracker.totalTokensInput,
      totalTokensOutput: this.costTracker.totalTokensOutput,
      totalCost: this.costTracker.totalCost.toFixed(6),
      averageCostPerRequest: (
        this.costTracker.totalCost / Math.max(this.costTracker.totalRequests, 1)
      ).toFixed(6),
      startDate: this.costTracker.startDate,
    }
  }

  /**
   * Cache management
   */
  _setCache(key, value) {
    this.responseCache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  _getFromCache(key) {
    const cached = this.responseCache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > this.cacheTTL * 1000) {
      this.responseCache.delete(key)
      return null
    }

    logger.info(`📦 Cache hit for key: ${key}`)
    return cached.value
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Reset cost tracker (for testing)
   */
  resetCostTracker() {
    this.costTracker = {
      totalRequests: 0,
      totalTokensInput: 0,
      totalTokensOutput: 0,
      totalCost: 0,
      startDate: new Date(),
    }
    logger.info('Cost tracker reset')
  }
}

// Singleton instance
let geminiServiceInstance = null

function getGeminiService() {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService()
  }
  return geminiServiceInstance
}

module.exports = {
  GeminiService,
  getGeminiService,
}
