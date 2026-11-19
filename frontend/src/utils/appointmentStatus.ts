export const appointmentTabs=[
  {value:'all',label:'Tất cả'},{value:'pending',label:'Chờ xác nhận'},
  {value:'confirmed',label:'Đã xác nhận'},{value:'inProgress',label:'Đang khám'},
  {value:'completed',label:'Hoàn thành'},{value:'cancelled',label:'Đã hủy'},
] as const;
export type AppointmentTab=typeof appointmentTabs[number]['value'];
export function matchesAppointmentStatus(status:string,tab:AppointmentTab){
  return tab==='all'||(tab==='pending'&&['Đã đặt','Chờ duyệt'].includes(status))
    ||(tab==='confirmed'&&status==='Đã xác nhận')||(tab==='inProgress'&&status==='Đang khám')
    ||(tab==='completed'&&status==='Hoàn thành')||(tab==='cancelled'&&status==='Đã hủy');
}
