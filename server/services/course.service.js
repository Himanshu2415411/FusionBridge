const Course = require("../models/Course");

exports.addLesson = async (courseId, lessonData) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  course.lessons.push(lessonData);
  await course.save();

  return course;
};
