const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET /api/appointments/all - Lấy tất cả lịch đặt (để kiểm tra ca kín chỗ)
router.get('/all', appointmentController.getAllAppointments);

// POST /api/appointments - Tạo lịch đặt khám
router.post('/', appointmentController.createAppointment);

// GET /api/appointments - Lấy danh sách lịch đặt
router.get('/', appointmentController.getAppointments);

// PUT /api/appointments/:id/cancel - Hủy lịch đặt
router.put('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;