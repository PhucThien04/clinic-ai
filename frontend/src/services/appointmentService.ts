import API from './api';

export const appointmentService = {
  getSchedules: () => API.get('/schedules'),
  getAppointments: () => API.get('/appointments'),
  getOccupiedSchedules: () => API.get('/appointments/all'),
  createAppointment: (data: { IdHoSoBenhNhan: string; IdLichLamViec: string; LiDoKham: string }) =>
    API.post('/appointments', data),
  updateAppointment: (idChiTietLD: string, data: { IdLichLamViec: string; LiDoKham: string }) =>
    API.put(`/appointments/${encodeURIComponent(idChiTietLD)}`, data),
  cancelAppointment: (idChiTietLD: string) =>
    API.put(`/appointments/${encodeURIComponent(idChiTietLD)}/cancel`),
};
