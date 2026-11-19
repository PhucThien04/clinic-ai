const router = require('express').Router();
const controller = require('../controllers/userController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
router.use(verifyToken,requireRoles('Admin'));
router.get('/',controller.getUsers);
router.post('/',controller.createUser);
router.put('/:id',controller.updateUser);
module.exports=router;
