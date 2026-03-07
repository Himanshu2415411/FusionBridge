const { body } = require('express-validator');

const updateProgressValidation = [
  body('lessonId')
    .trim()
    .notEmpty()
    .withMessage('Lesson ID is required')
    .isMongoId()
    .withMessage('Lesson ID must be a valid MongoDB ObjectId'),

  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ObjectId'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
];

module.exports = {
  updateProgressValidation
};
