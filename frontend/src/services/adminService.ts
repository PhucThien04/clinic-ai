import API from './api';
export interface UserRecord {
  IdTaiKhoan:string;TenTaiKhoan:string;HoTen:string;CCCD:string;NgaySinh:string|null;GioiTinh:string|null;Email:string|null;
  SoDienThoai:string;DiaChi:string|null;TrangThai:string;VaiTro:string;
}
export interface UserPayload {TenTaiKhoan?:string;MatKhau?:string;HoTen:string;CCCD?:string;NgaySinh?:string;GioiTinh?:string;Email:string;SoDienThoai:string;DiaChi:string;TrangThai:string;VaiTro:string}
export const adminService={
  getUsers:async()=>(await API.get<UserRecord[]>('/users')).data,
  saveUser:(id:string|null,data:UserPayload)=>id?API.put(`/users/${encodeURIComponent(id)}`,data):API.post('/users',data),
};
