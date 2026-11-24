import type {ReactNode} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Activity, LogOut, LogIn, Calendar, FileText, Users, Building2, HeartPulse, Stethoscope, Clock, MapPin, Phone, Mail, ArrowUpRight} from 'lucide-react';
import {UserAvatar} from '../management/MediaImage';
import {NotificationBell} from '../notifications/NotificationBell';
import {useCurrentUser} from '../../hooks/useCurrentUser';
import {useClinic} from '../../hooks/useClinic';
import {authService} from '../../services/authService';
import {getActorWorkspace} from '../../utils/managementConfig';
import {fallbackServices, getClinicDisplay} from '../../utils/clinicDisplay';

const workspaceIcons = {calendar: Calendar, file: FileText, users: Users, clinic: Building2, nurse: HeartPulse, doctor: Stethoscope};

export default function Layout({children}: {children: ReactNode}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const {clinicInfo, services} = useClinic();
  const clinic = getClinicDisplay(clinicInfo);
  const canBook = !user || user.VaiTro === 'Bệnh nhân';
  const bookingPath = user ? '/patient-appointments' : '/login';
  const workspace = getActorWorkspace(user?.VaiTro);
  const WorkspaceIcon = workspace ? workspaceIcons[workspace.icon] : Calendar;
  const featuredServices = services.length ? services.slice(0, 5).map(service => service.TenDichVu) : fallbackServices;
  const linkClass = (path: string) => `shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${location.pathname === path ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'}`;

  return <div className="flex min-h-screen flex-col bg-slate-50">
    <div className="bg-slate-900 px-4 py-2 text-xs text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-between"><span className="font-semibold">{clinic.name}</span><div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"><a href={`tel:${clinic.phone}`} className="inline-flex items-center gap-1.5 hover:text-white"><Phone size={13}/>{clinic.phone}</a><span className="inline-flex items-center gap-1.5"><Clock size={13}/>{clinic.hours}</span></div></div>
    </div>
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:gap-4 lg:px-6">
        <Link to="/" aria-label={`${clinic.name} - Trang chủ`} className="flex min-w-0 items-center gap-2 text-base font-extrabold text-slate-900"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Activity size={26}/></span><span className="max-w-44 truncate xl:max-w-56">{clinic.name}</span></Link>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {canBook && <Link to={bookingPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 sm:px-4"><Calendar size={17}/><span>Đặt lịch khám</span></Link>}
          {user ? <>
            <Link to="/profile" aria-label="Hồ sơ cá nhân" title={`${user.HoTen} (${user.VaiTro})`} className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"><UserAvatar src={user.AnhDaiDien} name={user.HoTen} className="h-8 w-8"/><span className="hidden text-left lg:block"><span className="block max-w-28 truncate">{user.HoTen}</span><span className="block text-xs font-normal text-slate-500">{user.VaiTro}</span></span></Link>
            <NotificationBell/>
            <button type="button" aria-label="Đăng xuất" onClick={() => {authService.logout(); navigate('/login');}} className="inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"><LogOut size={18}/><span className="hidden xl:inline">Đăng xuất</span></button>
          </> : <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50"><LogIn size={17}/><span className="hidden sm:inline">Đăng nhập</span></Link>}
        </div>
        <nav aria-label="Điều hướng chính" className="flex w-full min-w-0 items-center gap-1 overflow-x-auto border-t border-slate-100 pt-2">
          <Link to="/" className={linkClass('/')}>Trang chủ</Link>
          <Link to="/dich-vu" className={linkClass('/dich-vu')}>Dịch vụ nha khoa</Link>
          <Link to="/su-kien" className={linkClass('/su-kien')}>Sự kiện & Ưu đãi</Link>
          {workspace && <><span aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-slate-200"/><Link to={workspace.path} className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition ${location.pathname.startsWith(workspace.path) ? 'border-teal-600 bg-teal-600 text-white' : 'border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-600 hover:bg-teal-600 hover:text-white'}`}><WorkspaceIcon size={17}/>{workspace.label}</Link></>}
        </nav>
      </div>
    </header>
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    <footer className="border-t border-slate-800 bg-slate-900 text-sm text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div><Link to="/" className="flex items-start gap-2 text-lg font-bold text-white"><Activity size={24} className="mt-1 shrink-0 text-sky-400"/>{clinic.name}</Link><p className="mt-4 whitespace-pre-line leading-7 text-slate-400">{clinic.description}</p></div>
        <div><h2 className="mb-5 font-bold text-white">Liên kết nhanh</h2><ul className="space-y-3"><li><Link to="/" className="hover:text-sky-300">Trang chủ</Link></li><li><Link to="/dich-vu" className="hover:text-sky-300">Dịch vụ nha khoa</Link></li><li><Link to="/su-kien" className="hover:text-sky-300">Sự kiện & Ưu đãi</Link></li>{canBook && <li><Link to={bookingPath} className="hover:text-sky-300">Đặt lịch khám</Link></li>}{user?.VaiTro === 'Bệnh nhân' && <li><Link to="/patient-history" className="hover:text-sky-300">Hồ sơ sức khỏe</Link></li>}{user && user.VaiTro !== 'Bệnh nhân' && workspace && <li><Link to={workspace.path} className="hover:text-sky-300">{workspace.label}</Link></li>}</ul></div>
        <div><h2 className="mb-5 font-bold text-white">Dịch vụ nổi bật</h2><ul className="space-y-3">{featuredServices.map((name, index) => <li key={`${name}-${index}`}><Link to="/dich-vu" className="inline-flex items-start gap-2 leading-6 hover:text-sky-300"><ArrowUpRight size={16} className="mt-1 shrink-0 text-teal-400"/>{name}</Link></li>)}</ul></div>
        <div><h2 className="mb-5 font-bold text-white">Liên hệ & Giờ làm việc</h2><address className="space-y-4 not-italic"><p className="flex gap-3 leading-6"><MapPin size={17} className="mt-1 shrink-0 text-sky-400"/>{clinic.address}</p><a href={`tel:${clinic.phone}`} className="flex items-center gap-3 hover:text-sky-300"><Phone size={17} className="shrink-0 text-sky-400"/>{clinic.phone}</a><a href={`mailto:${clinic.email}`} className="flex items-start gap-3 break-all leading-6 hover:text-sky-300"><Mail size={17} className="mt-1 shrink-0 text-sky-400"/>{clinic.email}</a><p className="flex items-center gap-3"><Clock size={17} className="shrink-0 text-teal-400"/>{clinic.hours}</p></address></div>
      </div>
      <div className="border-t border-slate-800 px-6 py-5 text-center text-xs leading-6 text-slate-400">© {new Date().getFullYear()} {clinic.name}. Chăm sóc nụ cười, đồng hành cùng bạn.</div>
    </footer>
  </div>;
}
