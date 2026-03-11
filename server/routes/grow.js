const express = require("express");
const { auth } = require("../middleware/auth");
const {
  getCareerProfile,
  createCareerProfile,
  updateCareerProfile,
  generateUserResume,
  downloadResume,
  analyzeUserResume,
  analyzeSkillGaps,
  generateProjectIdeas,
  getProjectIdeas,
  getCareerRoadmap,
  generateInterviewSession,
  getInterviewQuestions,
} = require("../controllers/grow.controller");

const router = express.Router();

router.get("/profile", auth, getCareerProfile);
router.post("/profile", auth, createCareerProfile);
router.put("/profile", auth, updateCareerProfile);
router.post("/resume/generate", auth, generateUserResume);
router.get("/resume/download", auth, downloadResume);
router.post("/resume/analyze", auth, analyzeUserResume);
router.get("/skills/analyze", auth, analyzeSkillGaps);
router.post("/projects/generate", auth, generateProjectIdeas);
router.get("/projects", auth, getProjectIdeas);
router.get("/roadmap", auth, getCareerRoadmap);
router.post("/interview/generate", auth, generateInterviewSession);
router.get("/interview", auth, getInterviewQuestions);

module.exports = router;
