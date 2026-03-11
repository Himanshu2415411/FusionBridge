const FreelanceProject = require("../models/FreelanceProject");
const { generateProposal } = require("../services/proposal.service");

// @desc    Create a new freelance project for the authenticated user
// @route   POST /api/earn/workspace/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const project = await FreelanceProject.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all freelance projects belonging to the authenticated user
// @route   GET /api/earn/workspace/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await FreelanceProject.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update the status of a freelance project
// @route   PUT /api/earn/workspace/projects/:projectId
// @access  Private
const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const project = await FreelanceProject.findOneAndUpdate(
      { _id: req.params.projectId, user: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Generate a proposal for a freelance project
// @route   POST /api/earn/workspace/projects/:projectId/proposal
// @access  Private
const generateProjectProposal = async (req, res) => {
  try {
    const project = await FreelanceProject.findOne({
      _id: req.params.projectId,
      user: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const proposal = generateProposal(project);

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProjectStatus,
  generateProjectProposal,
};
