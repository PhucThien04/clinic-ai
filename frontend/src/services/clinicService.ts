import API from './api';
export const clinicService={
  getServices:()=>API.get('/clinic/services'),
  getEvents:()=>API.get('/clinic/events'),
};
