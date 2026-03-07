const { body } = require('express-validator');

const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long')
    .isLength({ max: 120 })
    .withMessage('Title must not exceed 120 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('level')
    .trim()
    .notEmpty()
    .withMessage('Level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be one of: beginner, intermediate, advanced'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a numeric value')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    })
];

module.exports = {
  createCourseValidation
};
