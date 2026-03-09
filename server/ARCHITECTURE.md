# FusionBridge Backend Architecture

## 1. Overview

The FusionBridge backend is a RESTful API server built with **Node.js** and **Express**, backed by **MongoDB** via **Mongoose**. It powers the FusionBridge e-learning platform, handling user authentication, course management, learning progress tracking, quiz attempts, gamification, leaderboards, certificate generation, and platform analytics.

The server is designed around a layered architecture that separates concerns cleanly — routing, business logic, data access, and cross-cutting concerns (auth, validation) each live in their own layer.

---

## 2. Folder Structure

```
server/
├── routes/          # HTTP route definitions — map endpoints to controllers
├── controllers/     # Request handlers — parse input, call services, send response
├── services/        # Business logic — reusable operations independent of HTTP
├── models/          # Mongoose schemas and models — define data shape and DB access
├── middleware/      # Express middleware — auth guards, input validation, error handling
├── utils/           # Shared utility functions — pagination, weekly reset, helpers
├── config/          # Environment and database configuration
├── scripts/         # One-off scripts — seeding, migrations
└── index.js         # Server entry point — wires everything together, starts the server
```

| Folder | Responsibility |
|---|---|
| `routes/` | Declare HTTP verbs and paths; attach middleware chains; delegate to controllers |
| `controllers/` | Extract and validate inputs from `req`; orchestrate service calls; format `res` |
| `services/` | Encapsulate reusable business rules decoupled from Express request/response |
| `models/` | Mongoose schemas with field definitions, indexes, and virtual properties |
| `middleware/` | Auth guards (`auth`, `authorize`), request validators, enrollment checks |
| `utils/` | Stateless helpers — `getPaginationParams`, `resetWeeklyXP`, etc. |

---

## 3. Request Flow

Every API call follows a consistent pipeline:

```
Client Request
     │
     ▼
Route (routes/)
  ├── Apply middleware (auth, authorize, validators)
     │
     ▼
Controller (controllers/)
  ├── Extract params / body / query
  ├── Call service(s) or model(s) directly
  ├── Format response payload
     │
     ▼
Service (services/)   ← optional for complex logic
  ├── Orchestrate multi-model operations
  ├── Apply business rules
     │
     ▼
Model (models/)
  ├── Mongoose query / aggregation
     │
     ▼
Database (MongoDB)
     │
     ▼
Response sent back up the chain to Client
```

Controllers keep HTTP concerns; services keep business concerns; models keep persistence concerns. This separation makes each layer independently testable.

---

## 4. Key Systems

### Course System
Manages the full lifecycle of courses — creation, publishing, enrollment, and retrieval. Courses contain nested **sections** and **lessons** (including video content and quizzes). Instructors own courses; students enroll and track progress per course.

**Models involved:** `Course`, `User.enrolledCourses`

---

### Learning Progress Engine
Tracks a student's progress through lessons within an enrolled course. When a lesson is marked complete, progress percentage is recalculated and stored on the enrollment subdocument. Completing all lessons triggers course completion logic and XP rewards.

**Models involved:** `User.enrolledCourses`, `LessonProgress`

---

### Quiz Attempt System
Records every quiz attempt a student makes on a lesson's quiz. Stores answers, score (0–100), correct answer count, total questions, pass/fail status, and attempt number. Drives analytics endpoints (hardest quizzes, average scores).

**Model involved:** `QuizAttempt`

---

### Gamification Engine
Awards XP to users for completing lessons, quizzes, and courses. Maintains a running `xp` total and a `weeklyXP` counter that resets every Sunday. XP thresholds determine a user's `level`. Badges are awarded for milestone achievements.

**Fields involved:** `User.xp`, `User.weeklyXP`, `User.level`, `User.badges`

---

### Leaderboard System
Ranks users by `weeklyXP` with descending sort and pagination. Weekly XP is reset every Sunday at midnight via a scheduled cron job, giving all users a fresh start each week. The leaderboard endpoint is public (no auth required).

**Route:** `GET /api/analytics/leaderboard`
**Utility:** `utils/weeklyReset.js`

---

### Certificate System
Generates and stores certificates when a user completes a course. Each certificate carries a unique verification ID and records the user, course, completion date, and issued-at timestamp.

**Model involved:** `Certificate`
**Controller:** `controllers/certificate.controller.js`

---

### Analytics System
Provides platform-wide and user-specific metrics through a dedicated analytics router. Includes overview stats, course performance, student progress, instructor dashboards, recommendations, completion rates, active-learner counts, and hardest-quiz identification.

**Routes:** `routes/analytics.js`
**Controllers:** `controllers/dashboard.controller.js`

---

## 5. Security Layers

### Authentication Middleware (`middleware/auth.js` — `auth`)
Verifies the JWT token on every protected route. Decodes the token, loads the user from MongoDB, and attaches the user object to `req.user`. Requests with missing or invalid tokens are rejected with `401 Unauthorized`.

### Authorization Middleware (`middleware/auth.js` — `authorize`)
Role-based access control built on top of `auth`. Accepts one or more role strings (e.g., `"admin"`, `"instructor"`). Rejects users whose role does not match with `403 Forbidden`. Admin-only routes (e.g., overview analytics) and instructor-only routes (e.g., course creation) use this guard.

### Validation Layer (`middleware/validators/`)
Input validators run before controllers using **express-validator** or equivalent. They check field types, presence, length, and format on request bodies and query parameters. Invalid requests are rejected with `400 Bad Request` and a structured error list before any business logic runs.

### Enrollment Verification
Sensitive course content (lesson details, quiz submission) is gated behind enrollment checks. Controllers verify that `req.user` has an active enrollment entry for the requested course before returning data or accepting submissions, preventing unauthorized access to paid content.

### XP Abuse Prevention
XP is awarded server-side only — clients never send XP values directly. Each lesson completion and quiz submission is validated for authenticity (correct user, enrolled course, lesson exists) before XP is credited. The weekly reset prevents indefinite accumulation from inflating leaderboard rankings.

---

## 6. Scheduler System

A **weekly leaderboard reset** runs automatically every **Sunday at midnight (00:00 UTC)** using `node-cron`.

**Schedule expression:** `"0 0 * * 0"`

**Implementation:**
- `utils/weeklyReset.js` exports `resetWeeklyXP()`, which executes `User.updateMany({}, { $set: { weeklyXP: 0 } })` — a single atomic MongoDB operation that zeroes every user's weekly XP.
- `index.js` registers the cron job on server startup using `cron.schedule(...)`.
- The same `resetWeeklyXP` function is exposed via `POST /api/analytics/reset-weekly-xp` for manual admin-triggered resets.

```
Every Sunday 00:00
       │
       ▼
cron.schedule (index.js)
       │
       ▼
resetWeeklyXP() (utils/weeklyReset.js)
       │
       ▼
User.updateMany({}, { $set: { weeklyXP: 0 } })
       │
       ▼
All users' weeklyXP = 0 → Leaderboard resets
```

---

## 7. API Base URL

```
http://localhost:5000/api
```

| Prefix | Router file |
|---|---|
| `/api/auth` | `routes/auth.js` |
| `/api/courses` | `routes/courses.js` |
| `/api/analytics` | `routes/analytics.js` |
| `/api/certificates` | `routes/certificates.js` |
| `/api/users` | `routes/users.js` |
