import API from './api';

export const patientService = {
  getHistories:(id:string)=>API.get('/patients/histories',{params:{idHoSoBenhNhan:id}}),
  getExamHistories:(id:string)=>API.get('/patients/exam-histories',{params:{idHoSoBenhNhan:id}}),
  createRelative:(data:object)=>API.post('/patients/profiles',data),
  updateRelative:(data:object)=>API.put('/patients/relatives',data),
  createHistory:(data:object)=>API.post('/patients/histories',data),
  updateHistory:(id:string,data:object)=>API.put(`/patients/histories/${encodeURIComponent(id)}`,data),
  deleteHistory:(id:string)=>API.delete(`/patients/histories/${encodeURIComponent(id)}`),
  getProfiles: () => API.get('/patients/profiles'),
  deleteProfile: (idHoSo: string) =>
    API.delete(`/patients/profiles/${encodeURIComponent(idHoSo)}`),
};
