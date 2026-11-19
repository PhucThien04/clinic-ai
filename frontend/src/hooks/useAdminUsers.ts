import {useCallback,useEffect,useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import {adminService} from '../services/adminService';
import type {UserRecord} from '../services/adminService';
import {clinicalError,normalizeClinicalSearch} from '../utils/clinicalExamUtils';
import {useManagementAction} from './useManagementAction';
const emptyUser={TenTaiKhoan:'',MatKhau:'',HoTen:'',CCCD:'',NgaySinh:'',GioiTinh:'',Email:'',SoDienThoai:'',DiaChi:'',TrangThai:'Hoạt động',VaiTro:'Nhân viên'};
export function useAdminUsers(){
  const action=useManagementAction();const [users,setUsers]=useState<UserRecord[]>([]);const [loading,setLoading]=useState(false);
  const [role,setRole]=useState('');const [state,setState]=useState('');const [search,setSearch]=useState('');
  const [form,setForm]=useState(emptyUser);const [editingId,setEditingId]=useState<string|null>(null);const [formOpen,setFormOpen]=useState(false);
  const load=useCallback(async()=>{setLoading(true);try{setUsers(await adminService.getUsers());action.setError('');}catch(error){action.setError(clinicalError(error));}finally{setLoading(false);}},[action.setError]);
  useEffect(()=>{void load();},[load]);
  const filteredUsers=useMemo(()=>{const keyword=normalizeClinicalSearch(search);return users.filter(row=>(!role||row.VaiTro===role)&&(!state||row.TrangThai===state)&&normalizeClinicalSearch(`${row.HoTen} ${row.TenTaiKhoan} ${row.SoDienThoai} ${row.IdTaiKhoan}`).includes(keyword));},[users,role,state,search]);
  const openUser=(row?:UserRecord)=>{setEditingId(row?.IdTaiKhoan||null);setForm(row?{TenTaiKhoan:row.TenTaiKhoan,MatKhau:'',HoTen:row.HoTen,CCCD:row.CCCD,NgaySinh:row.NgaySinh||'',GioiTinh:row.GioiTinh||'',Email:row.Email||'',SoDienThoai:row.SoDienThoai,DiaChi:row.DiaChi||'',TrangThai:row.TrangThai,VaiTro:row.VaiTro}:emptyUser);setFormOpen(true);action.setError('');};
  const changeForm=(name:string,value:string)=>setForm(previous=>({...previous,[name]:value}));
  const saveUser=async(event:FormEvent)=>{event.preventDefault();if(await action.runAction(()=>adminService.saveUser(editingId,form),'Đã lưu tài khoản.')){setFormOpen(false);await load();}};
  return {...action,users,filteredUsers,loading,role,setRole,state,setState,search,setSearch,form,editingId,formOpen,setFormOpen,openUser,changeForm,saveUser,load};
}
