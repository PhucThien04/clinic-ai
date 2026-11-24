import { isAxiosError } from 'axios';
import type { PatientExamDetail, VitalsPayload } from '../services/examinationService';

export const getVietnamToday = () => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (name: string) => parts.find(part => part.type === name)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};
export const clinicalError = (error: unknown) => isAxiosError<{ error?: string }>(error)
  ? error.response?.data?.error || 'Không thể kết nối máy chủ. Vui lòng thử lại.'
  : 'Không thể xử lý dữ liệu khám. Vui lòng thử lại.';
export const normalizeClinicalSearch = (value: string) => value.toLowerCase().normalize('NFD')
  .replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').trim();

export const vitalInputs = [
  { name: 'NhietDo', label: 'Nhiệt độ (°C)', step: '0.1', max: 999.9 },
  { name: 'HuyetApTamThu', label: 'Huyết áp tâm thu (mmHg)', step: '1', max: 32767 },
  { name: 'HuyetApTamTruong', label: 'Huyết áp tâm trương (mmHg)', step: '1', max: 32767 },
  { name: 'NhipTim', label: 'Nhịp tim (lần/phút)', step: '1', max: 32767 },
  { name: 'NhipTho', label: 'Nhịp thở (lần/phút)', step: '1', max: 32767 },
  { name: 'CanNang', label: 'Cân nặng (kg)', step: '0.01', max: 999.99 },
  { name: 'ChieuCao', label: 'Chiều cao (cm)', step: '0.01', max: 999.99 },
] as const;
type NumericField = typeof vitalInputs[number]['name'];
export type VitalsForm = Record<NumericField | 'TrieuChung' | 'ThoiDiemKhoiPhat' | 'MucDo' | 'GhiChu', string>;
export const emptyVitals: VitalsForm = { NhietDo: '', HuyetApTamThu: '', HuyetApTamTruong: '', NhipTim: '',
  NhipTho: '', CanNang: '', ChieuCao: '', TrieuChung: '', ThoiDiemKhoiPhat: '', MucDo: '', GhiChu: '' };
export const recordToVitals = (record: PatientExamDetail): VitalsForm => ({
  ...Object.fromEntries(vitalInputs.map(field => [field.name, String(record[field.name] ?? '')])) as Record<NumericField, string>,
  TrieuChung: record.TrieuChung ?? '', ThoiDiemKhoiPhat: record.ThoiDiemKhoiPhat?.slice(0, 16) ?? '',
  MucDo: record.MucDo ?? '', GhiChu: record.GhiChu ?? '',
});
export const vitalsToPayload = (id: string, form: VitalsForm): VitalsPayload => ({ idHoSoBenhNhan: id,
  ...Object.fromEntries(vitalInputs.map(field => [field.name, form[field.name].trim() === '' ? null : Number(form[field.name])])),
  TrieuChung: form.TrieuChung.trim() || null, ThoiDiemKhoiPhat: form.ThoiDiemKhoiPhat || null,
  MucDo: form.MucDo || null, GhiChu: form.GhiChu.trim() || null,
});
