const InterviewQuestion = require("../models/InterviewQuestion")
const CareerProfile = require("../models/CareerProfile")

const ROLE_QUESTIONS = {
  Frontend: [
    { question: "What is the virtual DOM and how does it work?", type: "technical", difficulty: "easy" },
    { question: "Explain React hooks and why they were introduced.", type: "technical", difficulty: "medium" },
    { question: "What is the difference between useEffect and useMemo?", type: "technical", difficulty: "medium" },
    { question: "How does the browser render a webpage?", type: "technical", difficulty: "easy" },
    { question: "What are CSS specificity rules?", type: "technical", difficulty: "easy" },
    { question: "Explain the concept of code splitting in a React app.", type: "coding", difficulty: "medium" },
    { question: "How would you optimize the performance of a slow React application?", type: "technical", difficulty: "hard" },
    { question: "Implement a debounce function from scratch.", type: "coding", difficulty: "medium" },
  ],
  Backend: [
    { question: "What is a REST API and what are its constraints?", type: "technical", difficulty: "easy" },
    { question: "Explain authentication with JWT — how is a token issued and verified?", type: "technical", difficulty: "medium" },
    { question: "What is the difference between SQL and NoSQL databases?", type: "technical", difficulty: "easy" },
    { question: "How would you handle rate limiting in an Express app?", type: "technical", difficulty: "medium" },
    { question: "Explain the event loop in Node.js.", type: "technical", difficulty: "medium" },
    { question: "Design a RESTful API for a blog platform.", type: "coding", difficulty: "hard" },
    { question: "What are database indexes and when should you use them?", type: "technical", difficulty: "medium" },
  ],
  Fullstack: [
    { question: "How does a request travel from a browser to a database and back?", type: "technical", difficulty: "easy" },
    { question: "What is server-side rendering and when would you choose it?", type: "technical", difficulty: "medium" },
    { question: "Explain CORS and how to handle it in an Express app.", type: "technical", difficulty: "medium" },
    { question: "How would you implement real-time updates in a fullstack app?", type: "coding", difficulty: "hard" },
    { question: "What strategies exist for managing state in a large React application?", type: "technical", difficulty: "hard" },
  ],
  "Data Scientist": [
    { question: "What is the difference between supervised and unsupervised learning?", type: "technical", difficulty: "easy" },
    { question: "Explain the bias-variance tradeoff.", type: "technical", difficulty: "medium" },
    { question: "How do you handle missing data in a dataset?", type: "technical", difficulty: "easy" },
    { question: "Walk through how you would build and evaluate a classification model.", type: "coding", difficulty: "hard" },
    { question: "What is cross-validation and why is it important?", type: "technical", difficulty: "medium" },
  ],
  DevOps: [
    { question: "What is the difference between a container and a virtual machine?", type: "technical", difficulty: "easy" },
    { question: "Explain a CI/CD pipeline you have set up.", type: "technical", difficulty: "medium" },
    { question: "How does Kubernetes achieve high availability?", type: "technical", difficulty: "hard" },
    { question: "What is Infrastructure as Code and which tools support it?", type: "technical", difficulty: "medium" },
    { question: "How would you monitor and alert on a production service?", type: "technical", difficulty: "medium" },
  ],
}

const BEHAVIORAL_QUESTIONS = [
  { question: "Describe a challenging project you built and how you overcame obstacles.", type: "behavioral", difficulty: "medium" },
  { question: "Tell me about a time you had to learn a new technology quickly.", type: "behavioral", difficulty: "easy" },
  { question: "How do you handle disagreements with teammates about technical decisions?", type: "behavioral", difficulty: "medium" },
  { question: "Describe a situation where you improved a process or workflow.", type: "behavioral", difficulty: "medium" },
]

async function generateInterviewQuestions(userId) {
  const profile = await CareerProfile.findOne({ user: userId })
  const targetRole = profile?.targetRole ?? ""

  // Find the best matching role key
  const matchedKey = Object.keys(ROLE_QUESTIONS).find((key) =>
    targetRole.toLowerCase().includes(key.toLowerCase())
  )

  const roleSpecificQuestions = matchedKey ? ROLE_QUESTIONS[matchedKey] : []

  const allQuestions = [...roleSpecificQuestions, ...BEHAVIORAL_QUESTIONS].map((q) => ({
    user: userId,
    role: targetRole || "General",
    question: q.question,
    type: q.type,
    difficulty: q.difficulty,
  }))

  const saved = await InterviewQuestion.insertMany(allQuestions)
  return saved
}

module.exports = {
  generateInterviewQuestions,
}
