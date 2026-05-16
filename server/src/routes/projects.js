const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { onlyAdmins } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema
} = require('../schemas');

router.use(protect);

router.get('/', ctrl.list);
router.post('/', onlyAdmins, validate(createProjectSchema), ctrl.create);

router.get('/:id', ctrl.get);
router.put('/:id', onlyAdmins, validate(updateProjectSchema), ctrl.update);
router.delete('/:id', onlyAdmins, ctrl.remove);

router.post('/:id/members', onlyAdmins, validate(addMemberSchema), ctrl.addMember);
router.delete('/:id/members/:userId', onlyAdmins, ctrl.removeMember);

module.exports = router;
