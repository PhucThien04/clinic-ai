const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { scopeAccount, ownsResource } = require('../middlewares/patientOwnership');

router.use(verifyToken, scopeAccount);

// GET /api/appointments/all - Lấy tất cả lịch đặt (để kiểm tra ca kín chỗ)
router.get('/all', appointmentController.getAllAppointments);

// POST /api/appointments - Tạo lịch đặt khám
router.post('/', appointmentController.createAppointment);

// GET /api/appointments - Lấy danh sách lịch đặt
router.get('/', appointmentController.getAppointments);

// PUT /api/appointments/:id/cancel - Hủy lịch đặt
router.put('/:id/cancel', ownsResource('appointment', req => req.params.id), appointmentController.cancelAppointment);
router.put('/:id', ownsResource('appointment', req => req.params.id), appointmentController.updateAppointment);

module.exports = router;
