const { body, param } = require('express-validator');

const submitQuizValidation = [
  body('lessonId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Lesson ID must be a valid MongoDB ObjectId'),

  body('answers')
    .notEmpty()
    .withMessage('Answers are required')
    .isArray()
    .withMessage('Answers must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('Answers array cannot be empty');
      }
      return true;
    }),

  body('answers.*')
    .isNumeric()
    .withMessage('Each answer must be numeric')
];

const submitQuizValidationWithParams = [
  param('lessonId')
    .trim()
    .notEmpty()
    .withMessage('Lesson ID is required')
    .isMongoId()
    .withMessage('Lesson ID must be a valid MongoDB ObjectId'),

  param('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ObjectId'),

  ...submitQuizValidation
];

module.exports = {
  submitQuizValidation,
  submitQuizValidationWithParams
};
