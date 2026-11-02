/**
 * Hàm sinh mã ID chuẩn CHAR(13) cho các bảng trong hệ thống
 * Cấu trúc: [Prefix] + [YYMMDD] + [Random Digits] = Đúng 13 ký tự
 * @param {string} prefix - Tiền tố của bảng (VD: 'TK', 'HS', 'LLV', 'LD', 'CT', 'TS', 'NT', 'PK', 'SK', 'DV', 'AI')
 * @returns {string} Mã ID đúng 13 ký tự
 */
const generateId = (prefix) => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  
  const dateStr = `${yy}${mm}${dd}`; // 6 ký tự (VD: '261028')
  
  const prefixLength = prefix.length;
  // Tổng độ dài mong muốn là 13
  const remainingLength = 13 - (prefixLength + dateStr.length);
  
  const min = Math.pow(10, remainingLength - 1);
  const max = Math.pow(10, remainingLength) - 1;
  const randomNum = Math.floor(min + Math.random() * (max - min + 1));

  return `${prefix}${dateStr}${randomNum}`;
};

module.exports = { generateId };