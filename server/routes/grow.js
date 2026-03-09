const express = require("express");
const { auth } = require("../middleware/auth");
const {
  getCareerProfile,
  createCareerProfile,
  updateCareerProfile,
} = require("../controllers/grow.controller");

const router = express.Router();

router.get("/profile", auth, getCareerProfile);
router.post("/profile", auth, createCareerProfile);
router.put("/profile", auth, updateCareerProfile);

module.exports = router;
