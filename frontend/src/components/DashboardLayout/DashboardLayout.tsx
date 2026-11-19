import type {ReactNode} from 'react';
import {Link,Navigate,useNavigate,useLocation} from 'react-router-dom';
import {Activity,LogOut,Home,Users,Calendar,FileText,HeartPulse,Stethoscope,Building2} from 'lucide-react';
import {authService} from '../../services/authService';
import {getActorNavigation} from '../../utils/managementConfig';
import {NotificationBell} from '../notifications/NotificationBell';

const icons={calendar:Calendar,file:FileText,users:Users,clinic:Building2,nurse:HeartPulse,doctor:Stethoscope};
export default function DashboardLayout({children}:{children:ReactNode}){
  const navigate=useNavigate();const location=useLocation();const user=authService.getCurrentUser();
  if(!user)return <Navigate to="/login" replace/>;
  const navigation=getActorNavigation(user.VaiTro);
  return <div className="flex min-h-screen bg-slate-50">
    <aside className="sticky top-0 flex h-screen w-65 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-200 p-5"><Link to="/" className="flex items-center gap-2.5 font-extrabold text-slate-900 no-underline"><Activity className="text-sky-600" size={26}/>HỆ THỐNG Y TẾ</Link></div>
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5" aria-label="Không gian làm việc">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 font-semibold text-slate-500 no-underline hover:bg-slate-50"><Home size={18}/>Về trang chủ</Link>
        {navigation.group&&<p className="pb-1 pt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{navigation.group}</p>}
        {navigation.items.map(item=>{
          const Icon=icons[item.icon];
          return <Link key={item.path} to={item.path} aria-current={location.pathname.startsWith(item.path)?'page':undefined}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold no-underline ${location.pathname.startsWith(item.path)?'bg-sky-100 text-sky-600':'text-slate-500 hover:bg-slate-50'}`}><Icon size={18}/>{item.label}</Link>;
        })}
      </nav>
      <div className="shrink-0 border-t border-slate-200 bg-white p-5">
        <div className="mb-3"><NotificationBell placement="sidebar"/></div>
        <Link to="/profile" className="mb-4 flex items-center gap-2.5 no-underline"><Users size={22} className="shrink-0 text-sky-600"/>
          <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{user.HoTen}</p><p className="text-xs text-slate-500">Xem hồ sơ cá nhân</p></div></Link>
        <button type="button" onClick={()=>{authService.logout();navigate('/login');}} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 p-2.5 text-sm font-semibold text-red-500"><LogOut size={16}/>Đăng xuất</button>
      </div>
    </aside>
    <main className="min-w-0 flex-1 p-6 xl:px-10 xl:py-8">{children}</main>
  </div>;
}
