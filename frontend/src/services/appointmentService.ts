import API from './api';

export const appointmentService = {
  cancelAppointment: (idChiTietLD: string) =>
    API.put(`/appointments/${encodeURIComponent(idChiTietLD)}/cancel`),
};
