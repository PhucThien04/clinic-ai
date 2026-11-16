export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.split("T")[0];

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string) => {
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
