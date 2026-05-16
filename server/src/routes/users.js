const express = require('express');
const router = express.Router();

const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' }
    });
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
