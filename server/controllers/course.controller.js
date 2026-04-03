const courseService = require("../services/course.service");
const Course = require("../models/Course");

exports.addLesson = async (req, res) => {
  try {
    const { title, duration } = req.body;
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Video file required" });
    }

    const videoUrl = req.file.path;

    const updatedCourse = await courseService.addLesson(id, {
      title,
      duration,
      videoUrl,
    });

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level = "beginner", price = 0, duration = 1 } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      instructor: req.user.id,
      level,
      price,
      duration,
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.isPublished = true;
    await course.save();

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
