const vietnamDay = now => {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value=type=>parts.find(part=>part.type===type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};

function normalizeNotificationTimestamp(notification,now=new Date()){
  if(typeof notification.timestamp==='string'&&Number.isFinite(Date.parse(notification.timestamp)))return notification.timestamp;
  // Mã chuẩn có phần ngày YYMMDD, không chứa giờ tạo thực tế.
  const match=/(?:^|:)(?:TK|SK|DV)(\d{2})(\d{2})(\d{2})\d{5}(?=:|$)/.exec(notification.id);
  if(match){
    const [,yy,mm,dd]=match;const day=`20${yy}-${mm}-${dd}`;
    const parsed=new Date(`${day}T00:00:00Z`);
    if(Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===day)return `${day}T00:00:00+07:00`;
  }
  // Thông báo tổng hợp hoặc mã dữ liệu cũ không hợp lệ dùng mốc quy ước hôm nay.
  return `${vietnamDay(now)}T08:00:00+07:00`;
}
module.exports={normalizeNotificationTimestamp};
