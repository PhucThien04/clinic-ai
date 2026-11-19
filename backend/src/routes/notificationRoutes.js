const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const controller = require('../controllers/notificationController');
router.get('/',verifyToken,controller.getNotifications);
module.exports=router;
