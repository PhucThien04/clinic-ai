import API from './api';
export interface UserProfile {IdTaiKhoan:string;TenTaiKhoan:string;HoTen:string;CCCD:string;NgaySinh:string|null;GioiTinh:string|null;Email:string|null;SoDienThoai:string;DiaChi:string|null;VaiTro:string;AnhDaiDien:string|null}
export const profileService={
  saveAvatar:async(AnhDaiDien:string|null)=>(await API.put<{profile:UserProfile}>('/profile',{AnhDaiDien})).data.profile,
  get:async()=>(await API.get<UserProfile>('/profile')).data,
  save:async(profile:UserProfile)=>(await API.put<{message:string;profile:UserProfile}>('/profile',profile)).data,
};
