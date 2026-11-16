const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Các API này bắt buộc phải đăng nhập
router.get('/', verifyToken, profileController.getProfile);
router.put('/', verifyToken, profileController.updateProfile);

module.exports = router;