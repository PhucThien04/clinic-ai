const service = require('../services/notificationService');
const { handle } = require('../utils/managementUtils');
const { normalizeNotificationTimestamp } = require('../utils/notificationTimestamp');
exports.getNotifications = handle(async (req,res) => {
  res.set('Cache-Control','no-store');
  const now=new Date();
  const notifications=(await service.getNotifications(req.user)).map(notification=>({...notification,timestamp:normalizeNotificationTimestamp(notification,now)}));
  res.json({notifications});
});
