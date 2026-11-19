import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {staffService} from '../services/staffService';
import type {ManagedAppointment,WorkSchedule,ScheduleResources,SchedulePayload} from '../services/staffService';
import {clinicalError,getVietnamToday,normalizeClinicalSearch} from '../utils/clinicalExamUtils';
import {useManagementAction} from './useManagementAction';
const emptySchedule:SchedulePayload={IdBacSi:'',IdPhongKham:'',NgayLamViec:getVietnamToday(),GioBatDau:'08:00',GioKetThuc:'08:30',TrangThai:'Hoạt động',GhiChu:''};
export function useStaffWorkspace(){
  const requestId=useRef(0);
  const action=useManagementAction();const [tab,setTab]=useState('appointments');
  const [date,setDate]=useState('');const [status,setStatus]=useState('');const [search,setSearch]=useState('');
  const [scheduleDate,setScheduleDate]=useState(getVietnamToday);
  const [appointments,setAppointments]=useState<ManagedAppointment[]>([]);const [schedules,setSchedules]=useState<WorkSchedule[]>([]);
  const [resources,setResources]=useState<ScheduleResources>({doctors:[],clinics:[]});const [loading,setLoading]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);const [formOpen,setFormOpen]=useState(false);const [form,setForm]=useState(emptySchedule);
  const load=useCallback(async()=>{const current=++requestId.current;setLoading(true);try{
    const [appointments,schedules,resources]=await Promise.all([staffService.getAppointments({date:date||undefined,status:status||undefined}),staffService.getSchedules(),staffService.getResources()]);
    if(current!==requestId.current)return;
    setAppointments(appointments);setSchedules(schedules);setResources(resources);action.setError('');
  }catch(error){if(current===requestId.current)action.setError(clinicalError(error));}finally{if(current===requestId.current)setLoading(false);}},[date,status,action.setError]);
  useEffect(()=>{void load();return()=>{requestId.current++;};},[load]);
  const keyword=normalizeClinicalSearch(search);
  const filteredAppointments=useMemo(()=>appointments.filter(row=>normalizeClinicalSearch(`${row.TenBenhNhan||''} ${row.IdHoSoBenhNhan} ${row.SoDienThoai||''}`).includes(keyword))
    .sort((a,b)=>Number(b.TrangThai==='Đã đặt')-Number(a.TrangThai==='Đã đặt')||`${a.NgayLamViec} ${a.GioBatDau}`.localeCompare(`${b.NgayLamViec} ${b.GioBatDau}`)),[appointments,keyword]);
  const availableScheduleDates=useMemo(()=>Array.from(new Set([getVietnamToday(),scheduleDate,...schedules.map(row=>row.NgayLamViec)])).sort(),[schedules,scheduleDate]);
  const filteredSchedules=useMemo(()=>schedules.filter(row=>row.NgayLamViec===scheduleDate&&normalizeClinicalSearch(`${row.TenBacSi} ${row.IdLichLamViec}`).includes(keyword))
    .sort((a,b)=>a.GioBatDau.localeCompare(b.GioBatDau)||a.TenBacSi.localeCompare(b.TenBacSi)),[schedules,scheduleDate,keyword]);
  const updateStatus=async(row:ManagedAppointment,target:string)=>{
    if(target==='Đã hủy'&&!window.confirm(`Hủy lịch khám của ${row.TenBenhNhan||row.IdHoSoBenhNhan}?`))return;
    if(await action.runAction(()=>staffService.updateStatus(row.IdChiTietLD,target),'Đã cập nhật lịch đặt.'))await load();
  };
  const openSchedule=(row?:WorkSchedule)=>{setEditingId(row?.IdLichLamViec||null);setForm(row?{IdBacSi:row.IdBacSi,IdPhongKham:row.IdPhongKham,NgayLamViec:row.NgayLamViec,GioBatDau:row.GioBatDau.slice(0,5),GioKetThuc:row.GioKetThuc.slice(0,5),TrangThai:row.TrangThai,GhiChu:row.GhiChu||''}:{...emptySchedule,NgayLamViec:scheduleDate,IdBacSi:resources.doctors[0]?.IdTaiKhoan||'',IdPhongKham:resources.clinics[0]?.IdPhongKham||''});setFormOpen(true);action.setError('');};
  const saveSchedule=async(event:FormEvent)=>{event.preventDefault();if(await action.runAction(()=>staffService.saveSchedule(editingId,form),'Đã lưu ca làm việc.')){setFormOpen(false);await load();}};
  const changeForm=(name:string,value:string)=>setForm(previous=>({...previous,[name]:value}));
  return {...action,tab,setTab,date,setDate,scheduleDate,setScheduleDate,availableScheduleDates,status,setStatus,search,setSearch,loading,filteredAppointments,filteredSchedules,resources,editingId,formOpen,setFormOpen,form,changeForm,load,updateStatus,openSchedule,saveSchedule};
}
