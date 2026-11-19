const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const {verifyToken,requireRoles}=require('../middlewares/authMiddleware');
const manage=[verifyToken,requireRoles('Chủ phòng khám','Admin')];
const optionalManage=(req,res,next)=>req.query.manage==='true'?verifyToken(req,res,()=>manage[1](req,res,next)):next();
router.get('/info',clinicController.getClinicInfo);
router.put('/services/:id',...manage,clinicController.updateService);
router.put('/events/:id',...manage,clinicController.updateEvent);
router.delete('/services/:id',...manage,clinicController.deleteService);
router.delete('/events/:id',...manage,clinicController.deleteEvent);

router.post('/info',...manage, clinicController.upsertClinicInfo);
router.post('/events',...manage, clinicController.createEvent);
router.get('/events',optionalManage, clinicController.getEvents);
router.post('/services',...manage, clinicController.createService);
router.get('/services',optionalManage, clinicController.getServices);

module.exports = router;
