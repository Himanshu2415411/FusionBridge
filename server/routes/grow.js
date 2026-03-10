const express = require("express");
const { auth } = require("../middleware/auth");
const {
  getCareerProfile,
  createCareerProfile,
  updateCareerProfile,
  generateUserResume,
} = require("../controllers/grow.controller");

const router = express.Router();

router.get("/profile", auth, getCareerProfile);
router.post("/profile", auth, createCareerProfile);
router.put("/profile", auth, updateCareerProfile);
router.post("/resume/generate", auth, generateUserResume);

module.exports = router;
