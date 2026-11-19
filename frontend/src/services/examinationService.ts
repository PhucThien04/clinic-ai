import API from './api';

type ClinicalNumber = number | string | null;

export interface ClinicalQueueItem {
  IdChiTietLD: string;
  IdLichDat: string;
  IdHoSoBenhNhan: string;
  NgayLamViec: string;
  GioBatDau: string;
  GioKetThuc: string;
  TenBacSi: string;
  TenPhongKham: string;
  LiDoKham: string | null;
  TrangThaiLich: string;
  LoaiThongTin: number;
  TenBenhNhan: string | null;
  MoiQuanHe: string | null;
  SoDienThoai: string | null;
  GioiTinh: string | null;
  NgaySinh: string | null;
  DaDoSinhHieu: boolean;
  DaChanDoan: boolean;
  LaCaCuaToi: boolean;
}

interface ChronicDiseaseItem {
  IdTienSuBenh: string;
  IdHoSoBenhNhan: string;
  TenBenh: string;
  MoTa: string | null;
  ThoiDiemMac: string | null;
  TrangThai: string | null;
  TenNguoiGhiNhan: string | null;
}

interface PastExamItem {
  IdChiTietLD: string;
  IdHoSoBenhNhan: string;
  NgayLamViec: string;
  GioBatDau: string;
  TenBacSi: string;
  LiDoKham: string | null;
  TrieuChung: string | null;
  ChuanDoan: string | null;
  KetLuan: string | null;
}

export interface PatientExamDetail {
  IdHoSoBenhNhan: string;
  LoaiThongTin: number;
  TenBenhNhan: string | null;
  MoiQuanHe: string | null;
  SoDienThoai: string | null;
  GioiTinh: string | null;
  NgaySinh: string | null;
  NhietDo: ClinicalNumber;
  HuyetApTamThu: ClinicalNumber;
  HuyetApTamTruong: ClinicalNumber;
  NhipTim: ClinicalNumber;
  NhipTho: ClinicalNumber;
  CanNang: ClinicalNumber;
  ChieuCao: ClinicalNumber;
  TrieuChung: string | null;
  ThoiDiemKhoiPhat: string | null;
  MucDo: string | null;
  GhiChu: string | null;
  ChuanDoan: string | null;
  KetLuan: string | null;
  ThoiDiemCapNhat: string | null;
  IdChiTietLD: string | null;
  LiDoKham: string | null;
  NgayLamViec: string | null;
  GioBatDau: string | null;
  TenBacSi: string | null;
  TrangThaiLich: string | null;
  TenPhongKham: string | null;
  tienSuBenh: ChronicDiseaseItem[];
  lichSuKhamTruoc: PastExamItem[];
}

export interface VitalsPayload {
  idHoSoBenhNhan: string;
  NhietDo?: number | null;
  HuyetApTamThu?: number | null;
  HuyetApTamTruong?: number | null;
  NhipTim?: number | null;
  NhipTho?: number | null;
  CanNang?: number | null;
  ChieuCao?: number | null;
  TrieuChung?: string | null;
  ThoiDiemKhoiPhat?: string | null;
  MucDo?: string | null;
  GhiChu?: string | null;
}

interface DiagnosisPayload {
  idHoSoBenhNhan: string;
  ChuanDoan: string;
  KetLuan: string;
}

interface ExamSaveResult { message: string; hoso: Partial<PatientExamDetail> }

export const getClinicalQueue = async (params?: { date?: string; all?: boolean }) =>
  (await API.get<ClinicalQueueItem[]>('/examinations/queue', { params })).data;
export const getPatientExamInfo = async (idHoSoBenhNhan: string) =>
  (await API.get<PatientExamDetail>(`/examinations/patient/${encodeURIComponent(idHoSoBenhNhan)}`)).data;
export const updateClinicalVitals = async (payload: VitalsPayload) =>
  (await API.put<ExamSaveResult>('/examinations/vitals', payload)).data;
export const updateDoctorDiagnosis = async (payload: DiagnosisPayload) =>
  (await API.put<ExamSaveResult>('/examinations/diagnosis', payload)).data;
