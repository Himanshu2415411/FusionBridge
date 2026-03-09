# FusionBridge — Developer Setup Guide

Get the backend running locally in five steps.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- [Postman](https://www.postman.com/) (optional, for API testing)

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/fusionbridge.git
cd fusionbridge
```

---

## 2. Install Dependencies

Navigate to the server directory and install all required packages:

```bash
cd server
npm install
```

---

## 3. Create the Environment File

Create a `.env` file in the `server/` directory:

```bash
# server/.env

PORT=5000
MONGO_URI=mongodb://localhost:27017/fusionbridge
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on. Default `5000`. |
| `MONGO_URI` | MongoDB connection string. Use a local URI or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI. |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens. Use a long, random string in production. |
| `JWT_EXPIRE` | Token expiry duration (e.g. `7d`, `24h`). Default `7d`. |

> **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 4. Start the Development Server

```bash
npm run dev
```

This starts the server with **nodemon**, which automatically restarts on file changes.

Expected output:

```
Server running on port 5000
MongoDB connected
Weekly leaderboard reset scheduler active
```

---

## 5. Verify the API is Running

Open your browser or a terminal and hit the base URL:

```
http://localhost:5000/api
```

To confirm a specific endpoint is reachable:

```bash
curl http://localhost:5000/api/analytics/platform-stats
```

Expected response:

```json
{
  "success": true,
  "stats": {
    "totalUsers": 0,
    "totalCourses": 0,
    "activeLearners": 0,
    "totalQuizAttempts": 0
  }
}
```

---

## 6. Test with Postman

1. Open **Postman** and create a new collection called `FusionBridge`.
2. Set a collection variable `baseUrl` to `http://localhost:5000/api`.
3. Use `{{baseUrl}}` as the prefix for all requests.

### Example: Register a user

- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Secret123"
}
```

The response includes a `token`. Copy it and set it as a collection variable `token` to use in authenticated requests:

- **Header:** `Authorization: Bearer {{token}}`

### Example: Get all courses

- **Method:** `GET`  
- **URL:** `{{baseUrl}}/courses`

---

## Project Scripts

| Script | Command | Description |
|---|---|---|
| Start dev server | `npm run dev` | Starts server with nodemon (auto-restart) |
| Start production | `npm start` | Starts server with node |

---

## Common Issues

**MongoDB connection refused**  
Make sure your MongoDB instance is running. For a local install:
```bash
mongod --dbpath /data/db
```
For Atlas, verify your IP is whitelisted and the `MONGO_URI` credentials are correct.

**Port already in use**  
Change the `PORT` value in `.env` to any available port (e.g. `5001`) and update your Postman `baseUrl` accordingly.

**JWT errors on protected routes**  
Ensure the `Authorization` header is set to `Bearer <token>` and the token has not expired. Re-login to get a fresh token.
