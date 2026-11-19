import API from './api';
export interface ClinicInfo {IdPhongKham:string;ChuPhongKham:string;TenPhongKham:string;DiaChi:string;SoDienThoai:string;Email:string;GioiThieu:string|null;GioMoCua:string|null;GioDongCua:string|null}
export interface ClinicService {IdDichVu:string;IdPhongKham:string;TenDichVu:string;MoTa:string|null;Gia:string;TrangThai:string}
export interface ClinicEvent {IdSuKien:string;IdPhongKham:string;TieuDe:string;NoiDung:string;TrangThai:string;ThoiGianBatDau:string|null;ThoiGianKetThuc:string|null}
export type ClinicPayload=Pick<ClinicInfo,'TenPhongKham'|'DiaChi'|'SoDienThoai'|'Email'> & {GioiThieu:string;GioMoCua:string;GioDongCua:string};
export interface ServicePayload {TenDichVu:string;MoTa:string;Gia:string;TrangThai:string}
export interface EventPayload {TieuDe:string;NoiDung:string;TrangThai:string;ThoiGianBatDau:string;ThoiGianKetThuc:string}
export const clinicManageService={
  getInfo:async()=>(await API.get<ClinicInfo|null>('/clinic/info')).data,
  getServices:async()=>(await API.get<ClinicService[]>('/clinic/services',{params:{manage:true}})).data,
  getEvents:async()=>(await API.get<ClinicEvent[]>('/clinic/events',{params:{manage:true}})).data,
  saveInfo:(data:ClinicPayload)=>API.post('/clinic/info',data),
  saveService:(id:string|null,data:ServicePayload)=>id?API.put(`/clinic/services/${encodeURIComponent(id)}`,data):API.post('/clinic/services',data),
  saveEvent:(id:string|null,data:EventPayload)=>id?API.put(`/clinic/events/${encodeURIComponent(id)}`,data):API.post('/clinic/events',data),
};
