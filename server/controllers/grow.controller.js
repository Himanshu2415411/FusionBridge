const CareerProfile = require("../models/CareerProfile");
const {
  generateResume,
  saveResume,
  generateResumePDF,
  analyzeResume,
} = require("../services/resume.service");
const { analyzeUserSkills } = require("../services/skill.service");
const { generateProjects } = require("../services/project.service");
const ProjectIdea = require("../models/ProjectIdea");
const { generateCareerRoadmap } = require("../services/roadmap.service");
const { generateInterviewQuestions } = require("../services/interview.service");
const InterviewQuestion = require("../models/InterviewQuestion");

const getCareerProfile = async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(200).json({ data: null, message: "No profile found" });
    }

    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createCareerProfile = async (req, res) => {
  try {
    const existing = await CareerProfile.findOne({ user: req.user._id });

    if (existing) {
      return res.status(400).json({ message: "Career profile already exists" });
    }

    const profile = await CareerProfile.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateCareerProfile = async (req, res) => {
  try {
    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Career profile not found" });
    }

    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generateUserResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resume = await generateResume(userId);
    await saveResume(userId, resume);
    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resume = await generateResume(userId);
    const pdfBuffer = await generateResumePDF(resume);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="resume-${userId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const analyzeUserResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resume = await generateResume(userId);
    const { score, suggestions } = analyzeResume(resume);
    res.status(200).json({ success: true, atsScore: score, suggestions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const analyzeSkillGaps = async (req, res) => {
  try {
    const skills = await analyzeUserSkills(req.user._id);
    res.status(200).json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generateProjectIdeas = async (req, res) => {
  try {
    const userId = req.user._id;
    const skills = await analyzeUserSkills(userId);
    const projects = await generateProjects(userId, skills);
    res.status(201).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProjectIdeas = async (req, res) => {
  try {
    const projects = await ProjectIdea.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCareerRoadmap = async (req, res) => {
  try {
    const roadmap = await generateCareerRoadmap(req.user._id);
    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generateInterviewSession = async (req, res) => {
  try {
    const questions = await generateInterviewQuestions(req.user._id);
    res.status(201).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getInterviewQuestions = async (req, res) => {
  try {
    const questions = await InterviewQuestion.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};
