import {useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {authService} from '../services/authService';
import {notificationService} from '../services/notificationService';
import type {Notification} from '../services/notificationService';

function readIds(key:string):string[]{
  try{const value:unknown=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter((id):id is string=>typeof id==='string').slice(-1000):[];}catch{return [];}
}
export function useNotifications(){
  const user=authService.getCurrentUser();
  const accountId:string=user?.IdTaiKhoan||'';
  const role:string=user?.VaiTro||'';
  const key=`clinic-notifications:read:${accountId}`;
  const location=useLocation();const navigate=useNavigate();
  const [data,setData]=useState<{accountId:string;role:string;items:Notification[]}>({accountId:'',role:'',items:[]});
  const [read,setRead]=useState<{key:string;ids:string[]}>(()=>({key,ids:readIds(key)}));
  const [open,setOpen]=useState(false);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
  const [now,setNow]=useState(Date.now);const refreshRef=useRef<()=>void>(()=>{});
  const containerRef=useRef<HTMLDivElement>(null);const buttonRef=useRef<HTMLButtonElement>(null);
  const notifications=data.accountId===accountId&&data.role===role?data.items:[];
  const readSet=new Set(read.key===key?read.ids:readIds(key));
  useEffect(()=>{
    if(!accountId)return;
    const controller=new AbortController();let pending=false;let queued=false;let debounce:number|undefined;
    const load=async()=>{
      if(controller.signal.aborted)return;
      if(pending){queued=true;return;}pending=true;setLoading(true);setNow(Date.now());
      try{const items=await notificationService.getNotifications(controller.signal);if(!controller.signal.aborted){setData({accountId,role,items});setError('');}}
      catch{if(!controller.signal.aborted)setError('Chưa thể tải thông báo. Hệ thống sẽ tự thử lại.');}
      finally{pending=false;if(!controller.signal.aborted){setLoading(false);if(queued){queued=false;void load();}}}
    };
    refreshRef.current=()=>void load();
    const changed=()=>{window.clearTimeout(debounce);debounce=window.setTimeout(()=>void load(),150);};
    window.addEventListener('notifications-changed',changed);
    void load();const timer=window.setInterval(()=>void load(),45000);
    return()=>{controller.abort();window.clearInterval(timer);window.clearTimeout(debounce);window.removeEventListener('notifications-changed',changed);refreshRef.current=()=>{};};
  },[accountId,role,location.pathname,location.search]);
  useEffect(()=>{setOpen(false);},[accountId,role,location.pathname,location.search]);
  useEffect(()=>{
    const sync=(event:StorageEvent)=>{if(event.key===key)setRead({key,ids:readIds(key)});};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[key]);
  useEffect(()=>{
    if(!open)return;
    const timer=window.setInterval(()=>setNow(Date.now()),30000);
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!containerRef.current?.contains(event.target))setOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);buttonRef.current?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{window.clearInterval(timer);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open]);
  const markRead=(ids:string[])=>{
    const merged=Array.from(new Set([...readIds(key),...readSet,...ids])).slice(-1000);
    setRead({key,ids:merged});try{localStorage.setItem(key,JSON.stringify(merged));}catch{/* Bộ nhớ không khả dụng: vẫn giữ trạng thái trong phiên hiện tại. */}
  };
  const markAsRead=(id:string)=>markRead([id]);
  const markAllAsRead=()=>markRead(notifications.map(item=>item.id));
  const selectNotification=(item:Notification)=>{markAsRead(item.id);setOpen(false);navigate(item.link);};
  const toggleOpen=()=>{if(!open){setNow(Date.now());refreshRef.current();}setOpen(!open);};
  return {loggedIn:!!accountId,notifications,unreadCount:notifications.filter(item=>!readSet.has(item.id)).length,isRead:(id:string)=>readSet.has(id),
    markAsRead,markAllAsRead,selectNotification,open,toggleOpen,now,loading,error,containerRef,buttonRef};
}
