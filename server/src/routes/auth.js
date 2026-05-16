const express = require('express');
const router = express.Router();

const { signup, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../schemas');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, me);

module.exports = router;
