import API from './api';

export const patientService = {
  deleteProfile: (idHoSo: string) =>
    API.delete(`/patients/profiles/${encodeURIComponent(idHoSo)}`),
};
