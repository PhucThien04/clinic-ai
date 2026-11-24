import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Đính kèm JWT Token vào request nếu có
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
// Mọi ghi dữ liệu thành công đều thông báo cho chuông tải lại, không đặt API vào Component.
API.interceptors.response.use(response=>{
  if(['post','put','patch','delete'].includes(response.config.method?.toLowerCase()||''))window.dispatchEvent(new Event('notifications-changed'));
  return response;
});
