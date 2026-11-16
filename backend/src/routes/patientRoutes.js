const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// --- Hồ sơ bệnh nhân ---
router.post('/profiles', patientController.createPatientProfile);
router.get('/profiles', patientController.getPatientProfiles);
router.delete("/profiles/:id", patientController.deletePatientProfile);

// --- Tiền sử bệnh ---
router.post('/histories', patientController.createMedicalHistory);
router.get('/histories', patientController.getMedicalHistoriesByProfile); // Lấy tiền sử bệnh theo hồ sơ
router.put("/histories/:id", patientController.updateMedicalHistory);
router.delete("/histories/:id", patientController.deleteMedicalHistory);

// --- Lịch sử khám bệnh thực tế ---
router.get('/exam-histories', patientController.getExamHistoriesByProfile);

// --- Thông tin người thân ---
router.get('/relatives', patientController.getRelativesByProfile); // Lấy người thân theo hồ sơ
router.put('/relatives', patientController.updateRelative);       // Cập nhật người thân

module.exports = router;