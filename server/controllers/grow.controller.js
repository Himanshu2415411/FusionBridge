const CareerProfile = require("../models/CareerProfile");

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

module.exports = {
  getCareerProfile,
  createCareerProfile,
  updateCareerProfile,
};
