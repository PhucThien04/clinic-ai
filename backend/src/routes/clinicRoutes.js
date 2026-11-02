const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');

router.post('/info', clinicController.upsertClinicInfo);
router.post('/events', clinicController.createEvent);
router.post('/services', clinicController.createService);
router.get('/services', clinicController.getServices);

module.exports = router;