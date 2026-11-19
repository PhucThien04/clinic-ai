import API from './api';
export interface ManagedAppointment {
  IdChiTietLD:string; IdLichDat:string; IdHoSoBenhNhan:string; TenBenhNhan:string|null; LoaiThongTin:number;
  MoiQuanHe:string|null; SoDienThoai:string|null; TenNguoiDat:string; NgayLamViec:string; GioBatDau:string; GioKetThuc:string;
  TenBacSi:string; TenPhongKham:string; LiDoKham:string|null; GhiChu:string|null; TrangThai:string;
}
export interface WorkSchedule {
  IdLichLamViec:string; IdBacSi:string; IdPhongKham:string; TenBacSi:string; TenPhongKham:string;
  NgayLamViec:string; GioBatDau:string; GioKetThuc:string; TrangThai:string; GhiChu:string|null;
}
export interface ScheduleResources { doctors:{IdTaiKhoan:string;HoTen:string}[]; clinics:{IdPhongKham:string;TenPhongKham:string}[] }
export interface SchedulePayload { IdBacSi:string;IdPhongKham:string;NgayLamViec:string;GioBatDau:string;GioKetThuc:string;TrangThai:string;GhiChu:string }
export const staffService={
  getAppointments:async(params:{date?:string;status?:string})=>(await API.get<ManagedAppointment[]>('/appointments/manage',{params})).data,
  updateStatus:(id:string,TrangThai:string)=>API.put(`/appointments/${encodeURIComponent(id)}/status`,{TrangThai}),
  getSchedules:async()=>(await API.get<WorkSchedule[]>('/schedules')).data,
  getResources:async()=>(await API.get<ScheduleResources>('/schedules/resources')).data,
  saveSchedule:(id:string|null,data:SchedulePayload)=>id?API.put(`/schedules/${encodeURIComponent(id)}`,data):API.post('/schedules',data),
};
