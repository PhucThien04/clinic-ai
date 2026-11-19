const express = require('express');
const router = express.Router();
const examinationController = require('../controllers/examinationController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);
const clinicalReaders = requireRoles('Y tá', 'Bác sĩ', 'Admin', 'Chủ phòng khám');

router.get('/queue', clinicalReaders, examinationController.getClinicalQueue);

// PUT /api/examinations/vitals - Y tá cập nhật sinh hiệu và triệu chứng
router.put('/vitals', requireRoles('Y tá', 'Admin', 'Chủ phòng khám'), examinationController.updateClinicalVitals);

// PUT /api/examinations/diagnosis - Bác sĩ cập nhật chẩn đoán và kết luận
router.put('/diagnosis', requireRoles('Bác sĩ', 'Admin', 'Chủ phòng khám'), examinationController.updateDoctorDiagnosis);

// Route lấy thông tin hồ sơ khám 
router.get('/patient/:idHoSoBenhNhan', clinicalReaders, examinationController.getPatientExamInfo);

module.exports = router;
