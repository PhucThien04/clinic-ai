const router=require('express').Router();
const {verifyToken,requireRoles}=require('../middlewares/authMiddleware');
const controller=require('../controllers/aiController');
router.use(verifyToken);
router.get('/results',requireRoles('Bác sĩ','Y tá','Admin','Chủ phòng khám'),controller.getAIResults);
router.post('/results',requireRoles('Bác sĩ','Admin','Chủ phòng khám'),controller.saveAIResult);
router.post('/analyze',requireRoles('Bác sĩ','Admin','Chủ phòng khám'),controller.analyzePatientExam);
module.exports=router;
