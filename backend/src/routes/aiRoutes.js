const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/results', aiController.saveAIResult);
router.get('/results', aiController.getAIResults);

module.exports = router;