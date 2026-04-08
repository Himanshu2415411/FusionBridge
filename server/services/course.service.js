const Course = require("../models/Course");
const User = require("../models/User");

exports.addLesson = async (courseId, lessonData) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  course.lessons.push(lessonData);
  await course.save();

  return course;
};

exports.enrollUser = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  const user = await User.findById(userId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  // Initialize if not exists
  if (!course.studentsEnrolledList) {
    course.studentsEnrolledList = [];
  }

  // Prevent duplicate enrollment
  const alreadyEnrolled = user.enrolledCourses.some(
    ec => ec.course.toString() === courseId
  );

  if (alreadyEnrolled) {
    throw new Error("User already enrolled in this course");
  }

  // Add to course's enrollment list
  if (!course.studentsEnrolledList.includes(userId)) {
    course.studentsEnrolledList.push(userId);
    course.studentsEnrolled += 1;
  }

  // Add to user's enrolled courses
  user.enrolledCourses.push({
    course: courseId,
    completedLessons: [],
    lastAccessedLesson: null,
  });

  await course.save();
  await user.save();

  return course;
};
