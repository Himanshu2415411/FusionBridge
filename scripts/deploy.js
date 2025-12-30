#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Starting deployment process...\n")

// Check if we're in the right directory
if (!fs.existsSync("package.json")) {
  console.error("❌ package.json not found. Please run this script from the project root.")
  process.exit(1)
}

// Check environment
const environment = process.argv[2] || "production"
console.log(`📦 Deploying to: ${environment}\n`)

try {
  // Install dependencies
  console.log("📥 Installing dependencies...")
  execSync("npm ci", { stdio: "inherit" })

  // Run tests
  console.log("🧪 Running tests...")
  execSync("npm test", { stdio: "inherit" })

  // Build the application
  console.log("🔨 Building application...")
  execSync("npm run build", { stdio: "inherit" })

  // Deploy based on environment
  if (environment === "production") {
    console.log("🌐 Deploying to production...")
    execSync("npm run deploy", { stdio: "inherit" })
  } else {
    console.log("🔍 Deploying preview...")
    execSync("npm run deploy:preview", { stdio: "inherit" })
  }

  console.log("\n✅ Deployment completed successfully!")
  console.log("🎉 Your application is now live!")
} catch (error) {
  console.error("\n❌ Deployment failed:", error.message)
  process.exit(1)
}
