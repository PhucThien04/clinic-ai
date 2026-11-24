import API from './api';
import type {ClinicInfo} from './clinicService';
export interface ClinicService {HinhAnh?:string|null;IdDichVu:string;IdPhongKham:string;TenDichVu:string;MoTa:string|null;Gia:string;TrangThai:string}
export interface ClinicEvent {HinhAnh?:string|null;IdSuKien:string;IdPhongKham:string;TieuDe:string;NoiDung:string;TrangThai:string;ThoiGianBatDau:string|null;ThoiGianKetThuc:string|null}
export type ClinicPayload=Pick<ClinicInfo,'TenPhongKham'|'DiaChi'|'SoDienThoai'|'Email'> & {GioiThieu:string;GioMoCua:string;GioDongCua:string};
export interface ServicePayload {HinhAnh:string;TenDichVu:string;MoTa:string;Gia:string;TrangThai:string}
export interface EventPayload {HinhAnh:string;TieuDe:string;NoiDung:string;TrangThai:string;ThoiGianBatDau:string;ThoiGianKetThuc:string}
export const clinicManageService={
  deleteService:(id:string)=>API.delete(`/clinic/services/${encodeURIComponent(id)}`),
  deleteEvent:(id:string)=>API.delete(`/clinic/events/${encodeURIComponent(id)}`),
  getInfo:async()=>(await API.get<ClinicInfo|null>('/clinic/info')).data,
  getServices:async()=>(await API.get<ClinicService[]>('/clinic/services',{params:{manage:true}})).data,
  getEvents:async()=>(await API.get<ClinicEvent[]>('/clinic/events',{params:{manage:true}})).data,
  saveInfo:(data:ClinicPayload)=>API.post('/clinic/info',data),
  saveService:(id:string|null,data:ServicePayload)=>id?API.put(`/clinic/services/${encodeURIComponent(id)}`,data):API.post('/clinic/services',data),
  saveEvent:(id:string|null,data:EventPayload)=>id?API.put(`/clinic/events/${encodeURIComponent(id)}`,data):API.post('/clinic/events',data),
};
