import type {ClinicInfo} from '../services/clinicService';
import {formatClinicHours} from './dateUtils';

export const fallbackServices = ['Khám răng tổng quát', 'Chăm sóc răng miệng', 'Điều trị nha khoa', 'Tư vấn thẩm mỹ nụ cười'];

export const getClinicDisplay = (info: ClinicInfo|null) => ({
  name: info?.TenPhongKham || 'Nha Khoa Đức Tín',
  description: info?.GioiThieu || 'Đồng hành cùng bạn trong việc chăm sóc sức khỏe răng miệng, từ thăm khám, tư vấn đến theo dõi quá trình điều trị.',
  address: info?.DiaChi || '54 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng',
  phone: info?.SoDienThoai || '0236 388 888',
  email: info?.Email || 'contact@nhakhoaductin.com',
  hours: formatClinicHours(info?.GioMoCua, info?.GioDongCua),
});

export const formatServicePrice = (price: string) => {
  const amount = Number(price);
  return Number.isFinite(amount) && amount >= 0 ? `${amount.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ tư vấn';
};
