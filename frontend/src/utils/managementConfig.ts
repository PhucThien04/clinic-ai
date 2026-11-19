export const userRoles=['Bệnh nhân','Nhân viên','Y tá','Bác sĩ','Admin','Chủ phòng khám'];
export const options=(values:string[])=>values.map(value=>({value,label:value}));
export const selfAdminWarning='Không thể tự khóa, tự xóa hoặc tự đổi vai trò Admin đang đăng nhập.';
export const isUnsafeSelfEdit=(editingId:string|null,currentId:string|undefined,form:{TrangThai:string;VaiTro:string})=>
  !!editingId&&editingId===currentId&&(form.TrangThai!=='Hoạt động'||form.VaiTro!=='Admin');
interface ActorLink {path:string;label:string;icon:'calendar'|'file'|'users'|'clinic'|'nurse'|'doctor'}
interface ActorNavigation {group:string;items:ActorLink[]}
const actorNavigation:Record<string,ActorNavigation>={
  'Bệnh nhân':{group:'Dịch vụ cá nhân',items:[{path:'/patient-appointments',label:'Đặt lịch khám',icon:'calendar'},{path:'/patient-history',label:'Hồ sơ & Lịch sử',icon:'file'}]},
  'Nhân viên':{group:'Quản lý vận hành',items:[{path:'/staff',label:'Lịch đặt & Ca làm việc',icon:'calendar'}]},
  'Y tá':{group:'Nghiệp vụ lâm sàng',items:[{path:'/nurse',label:'Bàn làm việc Y tá',icon:'nurse'}]},
  'Bác sĩ':{group:'Nghiệp vụ lâm sàng',items:[{path:'/doctor',label:'Phòng khám Bác sĩ',icon:'doctor'}]},
  Admin:{group:'Quản trị hệ thống',items:[{path:'/admin/users',label:'Quản lý tài khoản',icon:'users'}]},
  'Chủ phòng khám':{group:'Quản lý phòng khám',items:[{path:'/owner/clinic',label:'Quản lý phòng khám',icon:'clinic'}]},
};
export const getActorNavigation=(role?:string):ActorNavigation=>actorNavigation[role||'']||{group:'',items:[]};
export const getActorWorkspace=(role?:string)=>{
  const item=getActorNavigation(role).items[0];
  return item&&{...item,label:role==='Bệnh nhân'?'Khu vực cá nhân':item.label};
};
