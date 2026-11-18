const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { scopeAccount, ownsResource, ownsHistoryAppointment } = require('../middlewares/patientOwnership');

router.use(verifyToken, scopeAccount);
const profileFromQuery = ownsResource('profile', req => req.query.idHoSoBenhNhan);

// --- Hồ sơ bệnh nhân ---
router.post('/profiles', patientController.createPatientProfile);
router.get('/profiles', patientController.getPatientProfiles);
router.delete('/profiles/:id', ownsResource('profile', req => req.params.id), patientController.deletePatientProfile);

// --- Tiền sử bệnh ---
router.post('/histories', ownsResource('profile', req => req.body.IdHoSoBenhNhan), ownsHistoryAppointment, patientController.createMedicalHistory);
router.get('/histories', profileFromQuery, patientController.getMedicalHistoriesByProfile);
router.put('/histories/:id', ownsResource('history', req => req.params.id), patientController.updateMedicalHistory);
router.delete('/histories/:id', ownsResource('history', req => req.params.id), patientController.deleteMedicalHistory);

// --- Lịch sử khám bệnh thực tế ---
router.get('/exam-histories', profileFromQuery, patientController.getExamHistoriesByProfile);

// --- Thông tin người thân ---
router.get('/relatives', profileFromQuery, patientController.getRelativesByProfile);
router.put('/relatives', ownsResource('relative', req => req.body.IdThongTinNguoiThan), patientController.updateRelative);

module.exports = router;
