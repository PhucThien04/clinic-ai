const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// POST /api/appointments - Tạo lịch đặt khám
router.post('/', appointmentController.createAppointment);

// GET /api/appointments - Lấy danh sách lịch đặt
router.get('/', appointmentController.getAppointments);

module.exports = router;