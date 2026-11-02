const express = require('express');
const router = express.Router();
const examinationController = require('../controllers/examinationController');

// PUT /api/examinations/vitals - Y tá cập nhật sinh hiệu và triệu chứng
router.put('/vitals', examinationController.updateClinicalVitals);

// PUT /api/examinations/diagnosis - Bác sĩ cập nhật chẩn đoán và kết luận
router.put('/diagnosis', examinationController.updateDoctorDiagnosis);

module.exports = router;