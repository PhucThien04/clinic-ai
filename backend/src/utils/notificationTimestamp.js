function normalizeNotificationTimestamp(notification,now=new Date()){
  const timestamp=notification.timestamp;
  const parsed=typeof timestamp==='string'||timestamp instanceof Date?new Date(timestamp):null;
  return parsed&&Number.isFinite(parsed.getTime())?parsed.toISOString():now.toISOString();
}
module.exports={normalizeNotificationTimestamp};
