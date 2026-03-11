# FusionBridge Database Schema

FusionBridge uses **MongoDB** via **Mongoose**. All collections live in a single database. Documents use `ObjectId` references to express relationships between collections.

---

## Collections

1. [User](#1-user)
2. [Course](#2-course)
3. [QuizAttempt](#3-quizattempt)
4. [Certificate](#4-certificate)
5. [Activity](#5-activity)
6. [Notification](#6-notification)
7. [FreelanceProject](#7-freelanceproject)
8. [Contract](#8-contract)

---

## 1. User

**Collection:** `users`
**Model file:** `server/models/User.js`

Stores every registered account on the platform — students, instructors, and admins. Learning state, gamification data, and enrollment history are all embedded directly on the user document.

### Top-Level Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `firstName` | String | — | Required. Max 50 chars. |
| `lastName` | String | — | Required. Max 50 chars. |
| `email` | String | — | Required. Unique. Lowercased. |
| `password` | String | — | Required. Bcrypt-hashed. Not returned by default (`select: false`). |
| `avatar` | String | placeholder URL | Profile image URL. |
| `bio` | String | — | Max 500 chars. |
| `role` | String | `"student"` | `"student"` / `"instructor"` / `"admin"` |
| `isActive` | Boolean | `true` | Deactivated accounts cannot log in. |
| `isVerified` | Boolean | `false` | Email verification flag. |
| `lastLogin` | Date | now | Timestamp of most recent login. |
| `lastLearningDate` | Date | `null` | Used for streak calculation. |

### Gamification Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `xp` | Number | `0` | Cumulative experience points earned across all time. |
| `weeklyXp` | Number | `0` | XP earned in the current week. Reset to `0` every Sunday at midnight by the weekly cron job. Used to rank users on the leaderboard. |
| `level` | Number | `1` | Derived from `xp` via a pre-save hook: `level = floor(xp / 1000) + 1`. Automatically increments as XP grows. |
| `currentStreak` | Number | `0` | Consecutive days of learning activity. |
| `longestStreak` | Number | `0` | All-time longest streak in days. |
| `coursesCompleted` | Number | `0` | Total number of courses finished. |
| `totalLearningHours` | Number | `0` | Cumulative learning time in hours. |
| `lastWeeklyReset` | Date | now | Timestamp of the last `weeklyXp` reset. |
| `badges` | Array | `[]` | See [badges subdocument](#badges) below. |
| `skills` | Array | `[]` | Array of `{ name, level (1–5), verified }` objects. |

#### badges

Each badge is an embedded subdocument:

| Field | Type | Description |
|---|---|---|
| `name` | String | Badge title (e.g., `"First Lesson"`) |
| `icon` | String | Icon identifier or URL |
| `earnedAt` | Date | When the badge was awarded |

### enrolledCourses

`enrolledCourses` is an array of embedded subdocuments. Each entry represents one course enrollment for this user.

| Field | Type | Description |
|---|---|---|
| `course` | ObjectId → Course | Reference to the enrolled course. |
| `completedLessons` | ObjectId[] | Array of lesson `_id` values the user has completed. Progress percentage is derived from this array vs. the course's `totalLessons` virtual. |
| `lastAccessedLesson` | ObjectId | The most recently opened lesson. Used to power the "Resume" feature. |
| `enrolledAt` | Date | When enrollment was created. |
| `isCourseCompleted` | Boolean | `true` once all lessons are completed. |
| `completedAt` | Date | Timestamp of course completion. |
| `certificateUnlocked` | Boolean | `true` after course completion — gates PDF download. |
| `certificateId` | String | Unique certificate ID string (sparse index). |
| `progress` | — | **Not stored.** Calculated at runtime: `round(completedLessons.length / totalLessons * 100)`. |

#### lessonAccessHistory (inside enrolledCourses)

Tracks how many times and when each lesson was opened:

| Field | Type | Description |
|---|---|---|
| `lessonId` | ObjectId | The lesson that was accessed. |
| `lastAccessedAt` | Date | Most recent access timestamp. |
| `accessCount` | Number | Total number of opens. |

#### quizAttempts (inside enrolledCourses)

Lightweight summary of quiz attempts stored on the user side (mirrors `QuizAttempt` collection):

| Field | Type | Description |
|---|---|---|
| `lessonId` | ObjectId | Lesson whose quiz was attempted. |
| `score` | Number | Raw count of correct answers. |
| `totalQuestions` | Number | Total questions in the quiz. |
| `percentage` | Number | `round(score / totalQuestions * 100)` |
| `passed` | Boolean | `true` if `percentage >= 60`. |
| `attemptedAt` | Date | When this attempt was made. |

### Virtuals

| Virtual | Description |
|---|---|
| `fullName` | `firstName + " " + lastName` |
| `progressToNextLevel` | Percentage of XP progress from current level to next (0–100). One level = 1000 XP. |

### Indexes

| Fields | Purpose |
|---|---|
| `email: 1` | Unique lookup on login / registration |
| `level: -1, xp: -1` | Leaderboard-style sorting |

---

## 2. Course

**Collection:** `courses`
**Model file:** `server/models/Course.js`

Stores all course content including the nested curriculum (sections → lessons → quizzes). Courses are created by instructors and must be published before students can see them.

### Top-Level Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `title` | String | — | Required. Max 100 chars. |
| `description` | String | — | Required. Max 1000 chars. |
| `shortDescription` | String | — | Max 200 chars. Used in cards/previews. |
| `thumbnail` | String | placeholder | URL to cover image. |
| `instructor` | ObjectId → User | — | Required. The creating instructor. |
| `category` | String | — | Required. Enum (`"Web Development"`, `"Data Science"`, etc.). |
| `level` | String | — | Required. `"beginner"` / `"intermediate"` / `"advanced"` |
| `price` | Number | — | Required. `0` = free. |
| `originalPrice` | Number | — | Pre-discount price (drives `discountPercentage` virtual). |
| `duration` | Number | — | Estimated course length in hours (marketing copy). |
| `language` | String | `"English"` | Language of instruction. |
| `tags` | String[] | `[]` | Searchable keyword tags. |
| `requirements` | String[] | `[]` | Prerequisites listed on the course page. |
| `whatYouWillLearn` | String[] | `[]` | Learning outcomes. |
| `studentsEnrolled` | Number | `0` | Enrollment counter. Incremented on each enroll. |
| `averageRating` | Number | `0` | Recalculated by `calculateAverageRating()` on every new review. |
| `isPublished` | Boolean | `false` | Only published courses appear in public listings. |
| `featured` | Boolean | `false` | Surfaces course in featured sections. |
| `certificate` | Boolean | `true` | Whether the course awards a certificate on completion. |

### curriculum

`curriculum` is an array of **section** subdocuments. Each section contains an ordered array of **lessons**.

#### Section

| Field | Type | Description |
|---|---|---|
| `title` | String | Required. Section heading. |
| `description` | String | Optional section summary. |
| `order` | Number | Required. Position within the curriculum. |
| `lessons` | Lesson[] | Ordered array of lesson subdocuments. |

#### Lesson

| Field | Type | Description |
|---|---|---|
| `title` | String | Required. Lesson title displayed in the sidebar. |
| `description` | String | Required. Lesson summary. |
| `videoUrl` | String | Required. Hosted video URL. |
| `duration` | Number | Required. Length in minutes. |
| `order` | Number | Required. Position within the section. |
| `isPreview` | Boolean | If `true`, non-enrolled users can view this lesson. Default `false`. |
| `resources` | Array | Optional downloadable resources: `{ title, url, type: "pdf"/"link"/"code" }`. |
| `quiz` | QuizQuestion[] | Embedded quiz for this lesson. Default `[]`. |

#### QuizQuestion (embedded inside Lesson)

| Field | Type | Description |
|---|---|---|
| `question` | String | Required. The question text. |
| `options` | String[] | Required. At least 2 answer choices. |
| `correctAnswer` | Number | Required. Zero-based index into `options` for the correct answer. **Never sent to the client.** |

### reviews

Embedded array of user reviews:

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId → User | The reviewing student. |
| `rating` | Number | 1–5 stars. |
| `comment` | String | Max 500 chars. |
| `createdAt` | Date | Auto-set via `timestamps`. |

### Virtuals

| Virtual | Description |
|---|---|
| `totalLessons` | Sum of all lessons across all sections. |
| `totalDurationMinutes` | Sum of all lesson `duration` values in minutes. |
| `reviewCount` | `reviews.length` |
| `discountPercentage` | `round((originalPrice - price) / originalPrice * 100)` |

### Indexes

| Fields | Purpose |
|---|---|
| `title text, description text, tags text` | Full-text search |
| `category: 1, level: 1` | Filtered browsing |
| `averageRating: -1, studentsEnrolled: -1` | Popularity sorting |
| `instructor: 1` | Instructor dashboard queries |
| `isPublished: 1, featured: -1` | Public listing and featured queries |

---

## 3. QuizAttempt

**Collection:** `quizattempts`
**Model file:** `server/models/QuizAttempt.js`

Records every individual quiz submission across the platform. This collection is the source of truth for analytics — it drives the hardest-quizzes endpoint and platform-wide quiz stats.

> Note: A lightweight summary of quiz attempts is also stored as an embedded array inside `User.enrolledCourses[].quizAttempts`. `QuizAttempt` documents are the authoritative records used for aggregation queries.

### Fields

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId → User | Required. The student who submitted the attempt. |
| `course` | ObjectId → Course | Required. The course the quiz belongs to. |
| `lesson` | ObjectId | Required. The lesson whose quiz was attempted. (Not ref'd — embedded lesson IDs.) |
| `answers` | Number[] | The answer indices submitted by the user. Default `[]`. |
| `score` | Number | Required. 0–100. The raw percentage score for this attempt. |
| `correctAnswers` | Number | Required. Count of correct answers. `>= 0`. |
| `totalQuestions` | Number | Required. Total number of questions in the quiz. `>= 1`. |
| `passed` | Boolean | Required. `true` if `score >= 60`. |
| `attemptNumber` | Number | Required. Sequential attempt counter for this user/lesson pair. Starts at 1. |
| `createdAt` | Date | Timestamp of submission. Default `Date.now`. |

### Indexes

| Fields | Purpose |
|---|---|
| `user: 1` | Look up all attempts by a user |
| `lesson: 1` | Aggregate by lesson (hardest-quizzes pipeline groups on this) |
| `course: 1` | Filter attempts within a course |

### Key Usage

The `GET /api/analytics/hardest-quizzes` endpoint runs an aggregation pipeline on this collection:

```
$group by lesson → $avg of score → $sort asc → $limit 5
```

---

## 4. Certificate

**Collection:** `certificates`
**Model file:** `server/models/Certificate.js`

Created when a student completes all lessons in a course and their `certificateUnlocked` flag is set to `true`. Each certificate has two unique identifiers: a human-readable `certificateId` and a cryptographic `verificationHash` used for public verification.

### Fields

| Field | Type | Description |
|---|---|---|
| `certificateId` | String | Required. Unique. Human-readable ID (e.g., `CERT-2026-XXXXXX`). Displayed on the certificate PDF. |
| `verificationHash` | String | Required. Unique. Cryptographic hash used to publicly verify certificate authenticity at `GET /api/certificates/verify/:hash`. |
| `user` | ObjectId → User | Required. The student who earned the certificate. |
| `course` | ObjectId → Course | Required. The course that was completed. |
| `userName` | String | Required. Snapshot of the user's full name at time of issuance. Denormalized to preserve the certificate even if the user later changes their name. |
| `courseTitle` | String | Required. Snapshot of the course title at time of issuance. |
| `instructorName` | String | Required. Snapshot of the instructor's full name at time of issuance. |
| `completedAt` | Date | Required. When the student finished the course. |
| `createdAt` | Date | When the certificate document was created. Default `Date.now`. |

### Indexes

| Fields | Purpose |
|---|---|
| `certificateId: 1` | Lookup by readable ID |
| `verificationHash: 1` | Public verification endpoint lookup |

### Why Denormalized Fields?

`userName`, `courseTitle`, and `instructorName` are stored as plain strings rather than relying solely on `user` and `course` references. This ensures that the certificate remains accurate and verifiable even if the user renames themselves, the course is renamed, or the instructor changes their profile — the certificate always reflects the state at the time it was issued.

---

---

## 5. Activity

**Collection:** `activities`
**Model file:** `server/models/Activity.js`

Records a log of significant user actions across the platform. Written by event listeners (e.g., on `LESSON_COMPLETED`, `RESUME_GENERATED`) and surfaced via the activity feed API.

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `user` | ObjectId → User | — | Required. The user who performed the action. |
| `type` | String | — | Required. Event type constant (e.g., `LESSON_COMPLETED`, `RESUME_GENERATED`). |
| `message` | String | — | Required. Human-readable description of the activity. |
| `metadata` | Object | `{}` | Optional key-value payload carrying contextual data (e.g., course ID, lesson title). |
| `createdAt` | Date | `Date.now` | Timestamp of the activity. |

### Indexes

| Fields | Purpose |
|---|---|
| `user: 1, createdAt: -1` | Fast retrieval of recent activity per user |

---

## 6. Notification

**Collection:** `notifications`
**Model file:** `server/models/Notification.js`

Stores in-app notifications delivered to users. Created automatically by event listeners when platform events occur (course completion, résumé generation, project creation).

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `user` | ObjectId → User | — | Required. The recipient user. |
| `type` | String | — | Required. Notification category (mirrors event type constants). |
| `message` | String | — | Required. Notification body shown in the UI. |
| `read` | Boolean | `false` | `true` once the user has viewed the notification. |
| `createdAt` | Date | `Date.now` | Timestamp of creation. |

### Indexes

| Fields | Purpose |
|---|---|
| `user: 1, createdAt: -1` | Sorted notification listing per user |
| `user: 1, read: 1` | Fast unread notification count queries |

---

## 7. FreelanceProject

**Collection:** `freelanceprojects`
**Model file:** `server/models/FreelanceProject.js`

Represents a freelance project created and managed by a user inside the Earn module. Tracks project lifecycle from planning through to completion.

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `user` | ObjectId → User | — | Required. The user who owns the project. |
| `clientName` | String | — | Required. Name of the client or organization. |
| `title` | String | — | Required. Short project title. |
| `description` | String | — | Required. Full project description. |
| `techStack` | String[] | `[]` | Technologies used in the project. |
| `tasks` | Array | `[]` | Embedded task list: `{ title, completed (Boolean) }`. |
| `status` | String | `"planning"` | Project lifecycle stage: `"planning"` / `"in-progress"` / `"completed"` / `"on-hold"`. |
| `estimatedBudget` | Number | — | Estimated project budget in USD. |
| `estimatedDuration` | String | — | Human-readable duration estimate (e.g., `"2 weeks"`). |
| `createdAt` | Date | `Date.now` | Timestamp of project creation. |

### Indexes

| Fields | Purpose |
|---|---|
| `user: 1` | Fast project retrieval for user dashboards |

---

## 8. Contract

**Collection:** `contracts`
**Model file:** `server/models/Contract.js`

Stores AI-generated or manually created freelance contracts associated with a `FreelanceProject`. Each contract captures the agreed terms as a text document alongside project and client metadata.

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `user` | ObjectId → User | — | Required. The user who generated the contract. |
| `project` | ObjectId → FreelanceProject | — | Required. The associated freelance project. |
| `clientName` | String | — | Required. Name of the client the contract is addressed to. |
| `contractText` | String | — | Required. Full contract body text. |
| `createdAt` | Date | `Date.now` | Timestamp of contract creation. |

---

## Relationships Overview

```
User ──────────────────────── enrolledCourses[] ──────► Course
User ──────────────────────── quizAttempts[] (embed)
QuizAttempt ───────────────── user ──────────────────► User
QuizAttempt ───────────────── course ────────────────► Course
QuizAttempt ───────────────── lesson (ObjectId, no ref)
Certificate ───────────────── user ──────────────────► User
Certificate ───────────────── course ────────────────► Course
Activity ──────────────────── user ──────────────────► User
Notification ──────────────── user ──────────────────► User
FreelanceProject ─────────── user ──────────────────► User
Contract ──────────────────── user ──────────────────► User
Contract ──────────────────── project ───────────────► FreelanceProject
```

All cross-collection relationships use MongoDB `ObjectId` references. Mongoose `populate()` is used selectively — only the fields needed for a response are projected to keep payloads lean.
