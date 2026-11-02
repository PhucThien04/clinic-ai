const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// POST /api/schedules - Tạo ca làm việc mới
router.post('/', scheduleController.createSchedule);

// GET /api/schedules - Lấy danh sách lịch làm việc
router.get('/', scheduleController.getSchedules);

module.exports = router;