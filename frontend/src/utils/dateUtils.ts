export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  // Ngày lịch không phải thời điểm UTC: không chuyển qua Date/múi giờ.
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/.exec(dateStr);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

export const getClinicTimestamp = (date: string, time: string) =>
  Date.parse(`${date}T${time}+07:00`);

const formatNotificationDateTime = (timestamp: string) => {
  const date=new Date(timestamp);
  if(!Number.isFinite(date.getTime()))return '';
  const parts=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const value=(type:string)=>parts.find(part=>part.type===type)?.value||'';
  return `${value('hour')}:${value('minute')} · ${value('day')}/${value('month')}/${value('year')}`;
};

export const formatRelativeTime=(isoString:string,now:number=Date.now())=>{
  const timestamp=Date.parse(isoString);if(!Number.isFinite(timestamp))return '';
  const elapsed=Math.max(0,now-timestamp);const minutes=Math.floor(elapsed/60000);
  const day=(value:number)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
  const relative=minutes<1?'Vừa xong':minutes<60?`${minutes} phút trước`:
    day(timestamp)===day(now-86400000)?'Hôm qua':elapsed<86400000?`${Math.floor(elapsed/3600000)} giờ trước`:`${Math.floor(elapsed/86400000)} ngày trước`;
  return `${relative} · ${formatNotificationDateTime(isoString)}`;
};

export const formatDateTime = (dateStr?: string|null) => {
  if (!dateStr) return "";
  try {
    // Nếu db trả về format cũ (chỉ có giờ vd: 08:00:00)
    if (/^\d{2}:\d{2}:\d{2}$/.test(dateStr)) return dateStr.slice(0, 5);

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    // Tự động convert theo múi giờ địa phương (Việt Nam)
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${hours}:${minutes} ngày ${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};
