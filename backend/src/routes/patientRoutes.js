const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// --- Hồ sơ bệnh nhân ---
router.post('/profiles', patientController.createPatientProfile);
router.get('/profiles', patientController.getPatientProfiles);

// --- Tiền sử bệnh ---
router.post('/histories', patientController.createMedicalHistory);
router.get('/histories', patientController.getMedicalHistoriesByProfile); // Lấy tiền sử bệnh theo hồ sơ

// --- Thông tin người thân ---
router.get('/relatives', patientController.getRelativesByProfile); // Lấy người thân theo hồ sơ
router.put('/relatives', patientController.updateRelative);       // Cập nhật người thân

module.exports = router;