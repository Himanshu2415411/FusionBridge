# FusionBridge API Reference

**Base URL:** `http://localhost:5000/api`

All protected endpoints require the `Authorization: Bearer <token>` header.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Courses](#2-courses)
3. [Lessons](#3-lessons)
4. [Quiz](#4-quiz)
5. [Progress](#5-progress)
6. [Certificates](#6-certificates)
7. [Leaderboard](#7-leaderboard)
8. [Analytics](#8-analytics)
9. [Dashboard](#9-dashboard)
10. [Activity Feed](#10-activity-feed)
11. [Notifications](#11-notifications)
12. [Search](#12-search)

---

## 1. Auth

### POST /api/auth/register

Register a new user account.

**Authentication:** Not required

**Request Body:**

| Field | Type | Rules |
|---|---|---|
| `firstName` | string | 2–50 characters |
| `lastName` | string | 2–50 characters |
| `email` | string | Valid email address |
| `password` | string | Min 6 chars; must contain uppercase, lowercase, and a digit |

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Secret123"
}
```

**Response `201`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Validation failed / email already in use |
| `500` | Server error |

---

### POST /api/auth/login

Authenticate an existing user and receive a JWT token.

**Authentication:** Not required

**Request Body:**

| Field | Type | Rules |
|---|---|---|
| `email` | string | Valid email address |
| `password` | string | Required |

```json
{
  "email": "john@example.com",
  "password": "Secret123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Validation failed |
| `401` | Invalid credentials / account deactivated |
| `500` | Server error |

---

## 2. Courses

### GET /api/courses

Retrieve a paginated list of published courses. Authenticated users receive enrollment status and progress per course.

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filter by title (case-insensitive) |
| `category` | string | Filter by category |
| `level` | string | Filter by level (`beginner`, `intermediate`, `advanced`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

**Response `200`:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalCourses": 42,
  "totalPages": 5,
  "courses": [
    {
      "_id": "...",
      "title": "Node.js Fundamentals",
      "category": "Backend",
      "level": "beginner",
      "thumbnail": "https://...",
      "instructor": { "firstName": "Jane", "lastName": "Smith", "avatar": "..." },
      "averageRating": 4.5,
      "studentsEnrolled": 200,
      "isEnrolled": false,
      "progress": 0
    }
  ]
}
```

---

### POST /api/courses

Create a new course.

**Authentication:** Required — `instructor` or `admin` role

**Request Body:**

| Field | Type | Description |
|---|---|---|
| `title` | string | Course title |
| `description` | string | Course description |
| `category` | string | Course category |
| `level` | string | `beginner` / `intermediate` / `advanced` |
| `thumbnail` | string | Thumbnail image URL |
| `price` | number | Course price |

```json
{
  "title": "Node.js Fundamentals",
  "description": "Learn Node.js from scratch.",
  "category": "Backend",
  "level": "beginner",
  "thumbnail": "https://example.com/thumb.jpg",
  "price": 0
}
```

**Response `201`:**

```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "_id": "...",
    "title": "Node.js Fundamentals",
    "instructor": "...",
    "isPublished": false
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Validation failed |
| `401` | Not authenticated |
| `403` | Insufficient role |
| `500` | Server error |

---

### POST /api/courses/:courseId/enroll

Enroll the authenticated user in a course.

**Authentication:** Required

**URL Parameters:**

| Parameter | Description |
|---|---|
| `courseId` | MongoDB ObjectId of the course |

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "message": "Course enrolled successfully",
  "courseId": "..."
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Already enrolled |
| `401` | Not authenticated |
| `404` | Course not found |
| `500` | Server error |

---

## 3. Lessons

### GET /api/lessons/:courseId/:lessonId

Fetch the details of a specific lesson within a course. The user must be enrolled.

**Authentication:** Required

**URL Parameters:**

| Parameter | Description |
|---|---|
| `courseId` | MongoDB ObjectId of the course |
| `lessonId` | MongoDB ObjectId of the lesson |

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "lesson": {
      "_id": "...",
      "title": "Introduction to Express",
      "description": "...",
      "videoUrl": "https://...",
      "duration": 12,
      "order": 1,
      "isPreview": false,
      "quiz": []
    },
    "isCompleted": false
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Not enrolled in course |
| `404` | Course or lesson not found |
| `500` | Server error |

---

## 4. Quiz

### POST /api/lessons/:lessonId/quiz

Submit answers to a lesson quiz.

**Authentication:** Required

**URL Parameters:**

| Parameter | Description |
|---|---|
| `lessonId` | MongoDB ObjectId of the lesson |

**Request Body:**

| Field | Type | Description |
|---|---|---|
| `answers` | number[] | Array of selected answer indices (0-based) |
| `courseId` | string | MongoDB ObjectId of the course |

```json
{
  "courseId": "...",
  "answers": [0, 2, 1, 3]
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "totalQuestions": 4,
    "correctAnswers": 3,
    "percentage": 75,
    "passed": true,
    "lessonCompleted": true
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | No quiz available for this lesson |
| `401` | Not authenticated |
| `403` | Not enrolled in course |
| `404` | Course or lesson not found |
| `500` | Server error |

---

### GET /api/lessons/:lessonId/quiz-attempts

Retrieve all quiz attempt history for a lesson.

**Authentication:** Required

**URL Parameters:**

| Parameter | Description |
|---|---|
| `lessonId` | MongoDB ObjectId of the lesson |

**Query Parameters:**

| Parameter | Description |
|---|---|
| `courseId` | MongoDB ObjectId of the course (required) |

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "lessonId": "...",
      "score": 3,
      "totalQuestions": 4,
      "percentage": 75,
      "passed": true
    }
  ]
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `403` | Not enrolled in course |
| `500` | Server error |

---

## 5. Progress

### POST /api/progress/complete

Mark a lesson as completed for the authenticated user.

**Authentication:** Required

**Request Body:**

| Field | Type | Description |
|---|---|---|
| `courseId` | string | MongoDB ObjectId of the course |
| `lessonId` | string | MongoDB ObjectId of the lesson |

```json
{
  "courseId": "...",
  "lessonId": "..."
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Lesson marked as completed",
  "data": {
    "courseId": "...",
    "lessonId": "...",
    "totalLessons": 20,
    "completedLessonsCount": 5,
    "progressPercent": 25,
    "isCompleted": false,
    "lastAccessedLesson": "..."
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Validation failed |
| `401` | Not authenticated |
| `403` | Not enrolled in course |
| `404` | Course or lesson not found |
| `500` | Server error |

---

## 6. Certificates

### GET /api/certificates/verify/:hash

Publicly verify the authenticity of a certificate by its hash.

**Authentication:** Not required

**URL Parameters:**

| Parameter | Description |
|---|---|
| `hash` | Unique certificate verification hash |

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "certificate": {
    "_id": "...",
    "user": { "firstName": "John", "lastName": "Doe" },
    "course": { "title": "Node.js Fundamentals" },
    "issuedAt": "2026-01-15T10:00:00.000Z",
    "verificationHash": "abc123..."
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `404` | Certificate not found |
| `500` | Server error |

---

## 7. Leaderboard

### GET /api/analytics/leaderboard

Retrieve the weekly XP leaderboard, paginated and sorted by `weeklyXP` descending.

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "page": 1,
  "totalPages": 5,
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Doe",
      "avatar": "https://...",
      "weeklyXp": 850
    },
    {
      "rank": 2,
      "name": "Jane Smith",
      "avatar": "https://...",
      "weeklyXp": 720
    }
  ]
}
```

---

## 8. Analytics

### GET /api/analytics/platform-stats

Returns platform-wide aggregate statistics.

**Authentication:** Not required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "stats": {
    "totalUsers": 1200,
    "totalCourses": 45,
    "activeLearners": 870,
    "totalQuizAttempts": 15400
  }
}
```

> `activeLearners` = users enrolled in at least one course.

**Error Responses:**

| Status | Reason |
|---|---|
| `500` | Server error |

---

### GET /api/analytics/course-completion

Returns the overall course completion rate across all enrollments.

**Authentication:** Not required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "completionRate": 64,
  "totalEnrollments": 3500,
  "completedCourses": 2240
}
```

> `completionRate` is a whole-number percentage (0–100).
> `completedCourses` = enrollments where `progress === 100`.

**Error Responses:**

| Status | Reason |
|---|---|
| `500` | Server error |

---

### GET /api/analytics/hardest-quizzes

Returns the top 5 lessons with the lowest average quiz score (hardest quizzes), derived from the `QuizAttempt` collection.

**Authentication:** Not required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "hardestQuizzes": [
    {
      "lesson": "64b1f2c3a1d2e3f4a5b6c7d8",
      "averageScore": 31.5,
      "totalAttempts": 220
    },
    {
      "lesson": "64b1f2c3a1d2e3f4a5b6c7d9",
      "averageScore": 38.0,
      "totalAttempts": 185
    }
  ]
}
```

> Results are sorted ascending by `averageScore` (lowest first). `averageScore` is rounded to 2 decimal places.

**Error Responses:**

| Status | Reason |
|---|---|
| `500` | Server error |

---

### GET /api/analytics/weekly-active

Returns the count of users who have been active (based on `updatedAt`) within the past 7 days.

**Authentication:** Not required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "weeklyActiveUsers": 340
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `500` | Server error |

---

## 9. Dashboard

### GET /api/dashboard/overview

Returns aggregated dashboard data for the authenticated user, gathered from multiple domains in a single request. Responses are cached per user for 60 seconds.

**Authentication:** Required

**Request Body:** None

**Response `200` (cache miss):**

```json
{
  "success": true,
  "cached": false,
  "dashboard": {
    "xp": 1240,
    "streak": 5,
    "enrolledCourses": 3,
    "completedLessons": 18,
    "targetRole": "Backend Engineer",
    "skills": ["Node.js", "MongoDB"],
    "activeProjects": 2,
    "completedProjects": 1,
    "unreadNotifications": 4,
    "recentActivities": [
      {
        "_id": "...",
        "type": "LESSON_COMPLETED",
        "message": "Completed lesson: Introduction to Express",
        "createdAt": "2026-03-11T08:00:00.000Z"
      }
    ]
  }
}
```

**Response `200` (cache hit):**

Identical shape with `"cached": true`.

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `404` | User not found |
| `500` | Server error |

---

## 10. Activity Feed

### GET /api/activity

Returns the 20 most recent activity entries for the authenticated user, sorted by `createdAt` descending. Responses are cached per user for 60 seconds.

**Authentication:** Required

**Request Body:** None

**Response `200` (cache miss):**

```json
{
  "success": true,
  "cached": false,
  "data": [
    {
      "_id": "...",
      "user": "...",
      "type": "LESSON_COMPLETED",
      "message": "Completed lesson: Introduction to Express",
      "createdAt": "2026-03-11T08:00:00.000Z"
    },
    {
      "_id": "...",
      "user": "...",
      "type": "RESUME_GENERATED",
      "message": "Generated résumé",
      "createdAt": "2026-03-10T14:30:00.000Z"
    }
  ]
}
```

**Response `200` (cache hit):**

Identical shape with `"cached": true`.

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `500` | Server error |

---

## 11. Notifications

### GET /api/notifications

Returns the latest notifications for the authenticated user, sorted by `createdAt` descending.

**Authentication:** Required

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "user": "...",
      "message": "You completed the course: Node.js Fundamentals",
      "read": false,
      "createdAt": "2026-03-11T09:00:00.000Z"
    },
    {
      "_id": "...",
      "user": "...",
      "message": "Your résumé was generated successfully",
      "read": true,
      "createdAt": "2026-03-10T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `500` | Server error |

---

### PATCH /api/notifications/:id/read

Marks a specific notification as read.

**Authentication:** Required

**URL Parameters:**

| Parameter | Description |
|---|---|
| `id` | MongoDB ObjectId of the notification |

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Not authenticated |
| `404` | Notification not found |
| `500` | Server error |

---

## 12. Search

### GET /api/search?q=query

Searches across multiple content types and returns combined results.

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Search term (required) |

**Response `200`:**

```json
{
  "success": true,
  "query": "node",
  "results": {
    "courses": [
      {
        "_id": "...",
        "title": "Node.js Fundamentals",
        "category": "Backend",
        "level": "beginner",
        "thumbnail": "https://..."
      }
    ],
    "projectIdeas": [
      {
        "_id": "...",
        "title": "REST API with Node.js",
        "description": "Build a RESTful API using Node.js and Express."
      }
    ],
    "skills": [
      {
        "_id": "...",
        "name": "Node.js"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Missing or empty `q` parameter |
| `500` | Server error |
