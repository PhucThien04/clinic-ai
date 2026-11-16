import API from './api';

export interface LoginCredentials {
  TenTaiKhoan: string;
  MatKhau: string;
}

export interface RegisterData {
  TenTaiKhoan: string;
  MatKhau: string;
  HoTen: string;
  CCCD: string;
  NgaySinh?: string;
  GioiTinh?: string;
  Email?: string;
  SoDienThoai: string;
  DiaChi?: string;
  VaiTro: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await API.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};