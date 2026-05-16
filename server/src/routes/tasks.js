const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../schemas');

router.use(protect);

router.get('/dashboard/stats', ctrl.stats);

router.get('/', ctrl.list);
router.post('/', validate(createTaskSchema), ctrl.create);

router.get('/:id', ctrl.get);
router.put('/:id', validate(updateTaskSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
