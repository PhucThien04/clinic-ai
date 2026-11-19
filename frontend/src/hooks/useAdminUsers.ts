import {useCallback,useEffect,useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import {adminService} from '../services/adminService';
import type {UserRecord} from '../services/adminService';
import {clinicalError,normalizeClinicalSearch} from '../utils/clinicalExamUtils';
import {useManagementAction} from './useManagementAction';
import {authService} from '../services/authService';
import {isUnsafeSelfEdit,selfAdminWarning} from '../utils/managementConfig';
const emptyUser={AnhDaiDien:'',TenTaiKhoan:'',MatKhau:'',HoTen:'',CCCD:'',NgaySinh:'',GioiTinh:'',Email:'',SoDienThoai:'',DiaChi:'',TrangThai:'Hoạt động',VaiTro:'Nhân viên'};
export function useAdminUsers(){
  const currentUserId=authService.getCurrentUser()?.IdTaiKhoan as string|undefined;
  const [uploadingMedia,setUploadingMedia]=useState(false);
  const action=useManagementAction();const [users,setUsers]=useState<UserRecord[]>([]);const [loading,setLoading]=useState(false);
  const [role,setRole]=useState('');const [state,setState]=useState('');const [search,setSearch]=useState('');
  const [form,setForm]=useState(emptyUser);const [editingId,setEditingId]=useState<string|null>(null);const [formOpen,setFormOpen]=useState(false);
  const load=useCallback(async()=>{setLoading(true);try{setUsers(await adminService.getUsers());action.setError('');}catch(error){action.setError(clinicalError(error));}finally{setLoading(false);}},[action.setError]);
  useEffect(()=>{void load();},[load]);
  const filteredUsers=useMemo(()=>{const keyword=normalizeClinicalSearch(search);return users.filter(row=>(!role||row.VaiTro===role)&&(!state||row.TrangThai===state)&&normalizeClinicalSearch(`${row.HoTen} ${row.TenTaiKhoan} ${row.SoDienThoai} ${row.IdTaiKhoan}`).includes(keyword));},[users,role,state,search]);
  const openUser=(row?:UserRecord)=>{setEditingId(row?.IdTaiKhoan||null);setForm(row?{AnhDaiDien:row.AnhDaiDien||'',TenTaiKhoan:row.TenTaiKhoan,MatKhau:'',HoTen:row.HoTen,CCCD:row.CCCD,NgaySinh:row.NgaySinh||'',GioiTinh:row.GioiTinh||'',Email:row.Email||'',SoDienThoai:row.SoDienThoai,DiaChi:row.DiaChi||'',TrangThai:row.TrangThai,VaiTro:row.VaiTro}:emptyUser);setFormOpen(true);action.setError('');};
  const changeForm=(name:string,value:string)=>setForm(previous=>({...previous,[name]:value}));
  const selfWarning=isUnsafeSelfEdit(editingId,currentUserId,form)?selfAdminWarning:
    /Không thể tự xóa tài khoản Admin|Admin không thể tự khóa/.test(action.error)?action.error:'';
  const saveUser=async(event:FormEvent)=>{event.preventDefault();if(uploadingMedia)return;if(isUnsafeSelfEdit(editingId,currentUserId,form))return;if(await action.runAction(async()=>{const response=await adminService.saveUser(editingId,form);if(editingId===currentUserId)authService.updateCurrentUser(response.data.user);},'Đã lưu tài khoản.')){setFormOpen(false);await load();}};
  const deleteUser=async(id:string)=>{
    if(id===currentUserId){action.setError('Không thể tự xóa tài khoản Admin đang đăng nhập.');return;}
    const user=users.find(row=>row.IdTaiKhoan===id);
    if(!window.confirm(`Bạn có chắc muốn xóa tài khoản ${user?.TenTaiKhoan||id}? Tài khoản có dữ liệu nghiệp vụ cần chuyển sang Khóa.`))return;
    if(await action.runAction(()=>adminService.deleteUser(id),'Đã xóa tài khoản.')){
      if(editingId===id){setFormOpen(false);setEditingId(null);setForm(emptyUser);}
      await load();
    }
  };
  return {...action,uploadingMedia,setUploadingMedia,selfWarning,users,filteredUsers,loading,role,setRole,state,setState,search,setSearch,form,editingId,formOpen,setFormOpen,openUser,changeForm,saveUser,deleteUser,currentUserId,load};
}
