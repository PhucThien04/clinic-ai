const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
const manage = [verifyToken, requireRoles('Nhân viên', 'Admin', 'Chủ phòng khám')];
router.get('/resources', ...manage, scheduleController.getResources);
router.put('/:id', ...manage, scheduleController.updateSchedule);

// POST /api/schedules - Tạo ca làm việc mới
router.post('/', ...manage, scheduleController.createSchedule);

// GET /api/schedules - Lấy danh sách lịch làm việc
router.get('/', scheduleController.getSchedules);

module.exports = router;
