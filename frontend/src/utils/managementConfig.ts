export const userRoles=['Bệnh nhân','Nhân viên','Y tá','Bác sĩ','Admin','Chủ phòng khám'];
export const options=(values:string[])=>values.map(value=>({value,label:value}));
export const getManagementNavigation=(role?:string)=>[
  {path:'/staff',label:'Lịch đặt & Ca làm việc',roles:['Nhân viên','Admin','Chủ phòng khám']},
  {path:'/admin/users',label:'Quản lý tài khoản',roles:['Admin']},
  {path:'/owner/clinic',label:'Quản lý phòng khám',roles:['Chủ phòng khám','Admin']},
].filter(item=>item.roles.includes(role||''));
