import {useCallback,useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import type {FormEvent} from 'react';
import {clinicManageService} from '../services/clinicManageService';
import type {ClinicService,ClinicEvent,ClinicPayload,ServicePayload,EventPayload} from '../services/clinicManageService';
import {clinicalError} from '../utils/clinicalExamUtils';
import {useManagementAction} from './useManagementAction';
const emptyInfo:ClinicPayload={TenPhongKham:'',DiaChi:'',SoDienThoai:'',Email:'',GioiThieu:'',GioMoCua:'',GioDongCua:''};
const emptyService:ServicePayload={HinhAnh:'',TenDichVu:'',MoTa:'',Gia:'0',TrangThai:'Hiển thị'};
const emptyEvent:EventPayload={HinhAnh:'',TieuDe:'',NoiDung:'',TrangThai:'Hiển thị',ThoiGianBatDau:'',ThoiGianKetThuc:''};
export function useClinicManagement(){
  const [searchParams,setSearchParams]=useSearchParams();
  const requestedTab=searchParams.get('tab');const tab=requestedTab==='services'||requestedTab==='events'?requestedTab:'info';
  const [uploadingMedia,setUploadingMedia]=useState(false);const action=useManagementAction();const [loading,setLoading]=useState(false);
  const [info,setInfo]=useState(emptyInfo);const [services,setServices]=useState<ClinicService[]>([]);const [events,setEvents]=useState<ClinicEvent[]>([]);
  const [serviceForm,setServiceForm]=useState(emptyService);const [eventForm,setEventForm]=useState(emptyEvent);
  const [editingId,setEditingId]=useState<string|null>(null);const [formOpen,setFormOpen]=useState(false);
  const load=useCallback(async()=>{setLoading(true);try{
    const [clinic,services,events]=await Promise.all([clinicManageService.getInfo(),clinicManageService.getServices(),clinicManageService.getEvents()]);
    setInfo(clinic?{TenPhongKham:clinic.TenPhongKham,DiaChi:clinic.DiaChi,SoDienThoai:clinic.SoDienThoai,Email:clinic.Email,GioiThieu:clinic.GioiThieu||'',GioMoCua:clinic.GioMoCua?.slice(0,5)||'',GioDongCua:clinic.GioDongCua?.slice(0,5)||''}:emptyInfo);
    setServices(services);setEvents(events);action.setError('');
  }catch(error){action.setError(clinicalError(error));}finally{setLoading(false);}},[action.setError]);
  useEffect(()=>{void load();},[load]);
  const changeInfo=(name:string,value:string)=>setInfo(previous=>({...previous,[name]:value}));
  const changeService=(name:string,value:string)=>setServiceForm(previous=>({...previous,[name]:value}));
  const changeEvent=(name:string,value:string)=>setEventForm(previous=>({...previous,[name]:value}));
  const openService=(row?:ClinicService)=>{setEditingId(row?.IdDichVu||null);setServiceForm(row?{HinhAnh:row.HinhAnh||'',TenDichVu:row.TenDichVu,MoTa:row.MoTa||'',Gia:row.Gia,TrangThai:row.TrangThai}:emptyService);setFormOpen(true);action.setError('');};
  const openEvent=(row?:ClinicEvent)=>{setEditingId(row?.IdSuKien||null);setEventForm(row?{HinhAnh:row.HinhAnh||'',TieuDe:row.TieuDe,NoiDung:row.NoiDung,TrangThai:row.TrangThai,ThoiGianBatDau:row.ThoiGianBatDau?.slice(0,16)||'',ThoiGianKetThuc:row.ThoiGianKetThuc?.slice(0,16)||''}:emptyEvent);setFormOpen(true);action.setError('');};
  const saveInfo=async(event:FormEvent)=>{event.preventDefault();if(uploadingMedia)return;if(await action.runAction(()=>clinicManageService.saveInfo(info),'Đã lưu thông tin phòng khám.'))await load();};
  const saveService=async(event:FormEvent)=>{event.preventDefault();if(uploadingMedia)return;if(await action.runAction(()=>clinicManageService.saveService(editingId,serviceForm),'Đã lưu dịch vụ.')){setFormOpen(false);await load();}};
  const saveEvent=async(event:FormEvent)=>{event.preventDefault();if(uploadingMedia)return;if(await action.runAction(()=>clinicManageService.saveEvent(editingId,eventForm),'Đã lưu sự kiện.')){setFormOpen(false);await load();}};
  const deleteService=async(id:string)=>{
    if(!window.confirm('Xóa dịch vụ này?'))return;
    if(await action.runAction(()=>clinicManageService.deleteService(id),'Đã xóa dịch vụ.'))await load();
  };
  const deleteEvent=async(id:string)=>{
    if(!window.confirm('Xóa sự kiện này?'))return;
    if(await action.runAction(()=>clinicManageService.deleteEvent(id),'Đã xóa sự kiện.'))await load();
  };
  useEffect(()=>{setFormOpen(false);setEditingId(null);action.setError('');action.setMessage('');},[tab,action.setError,action.setMessage]);
  const switchTab=(tab:string)=>{const params=new URLSearchParams(searchParams);if(tab==='info')params.delete('tab');else params.set('tab',tab);setSearchParams(params);};
  return {...action,uploadingMedia,setUploadingMedia,deleteService,deleteEvent,tab,switchTab,loading,info,services,events,serviceForm,eventForm,editingId,formOpen,setFormOpen,changeInfo,changeService,changeEvent,openService,openEvent,saveInfo,saveService,saveEvent,load};
}
