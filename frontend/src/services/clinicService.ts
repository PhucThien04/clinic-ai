import API from './api';
export const clinicService={
  getServices:()=>API.get<ServiceItem[]>('/clinic/services'),
  getEvents:()=>API.get<EventItem[]>('/clinic/events'),
};

export interface ServiceItem {
  HinhAnh?:string|null;
  IdDichVu: string;
  TenDichVu: string;
  MoTa: string|null;
  Gia: string;
}

export interface EventItem {
  HinhAnh?:string|null;
  IdSuKien: string;
  TieuDe: string;
  NoiDung: string;
  TrangThai: string;
  ThoiGianBatDau?: string|null;
  ThoiGianKetThuc?: string|null;
}
