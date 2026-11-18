import API from './api';

export const patientService = {
  getProfiles: () => API.get('/patients/profiles'),
  deleteProfile: (idHoSo: string) =>
    API.delete(`/patients/profiles/${encodeURIComponent(idHoSo)}`),
};
