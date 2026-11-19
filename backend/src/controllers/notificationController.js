const service = require('../services/notificationService');
const { handle } = require('../utils/managementUtils');
exports.getNotifications = handle(async (req,res) => {
  res.set('Cache-Control','no-store');
  res.json({notifications:await service.getNotifications(req.user)});
});
