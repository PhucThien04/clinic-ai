import type {ReactNode} from 'react';
import {NotificationBell} from '../notifications/NotificationBell';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {Activity,LogOut,LogIn,UserRound} from 'lucide-react';
import {authService} from '../../services/authService';
import {getActorWorkspace} from '../../utils/managementConfig';

export default function Layout({children}:{children:ReactNode}){
  const navigate=useNavigate();const location=useLocation();const user=authService.getCurrentUser();
  const workspace=getActorWorkspace(user?.VaiTro);
  const linkClass=(path:string)=>`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold no-underline transition ${location.pathname===path?'bg-sky-600 text-white':'text-slate-600 hover:bg-sky-50 hover:text-sky-600'}`;
  return <div className="flex min-h-screen flex-col bg-slate-50">
    <div className="bg-slate-900 px-6 py-1.5 text-center text-xs text-slate-300">Nha khoa Đức Tín · Chăm sóc sức khỏe răng miệng</div>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-base font-extrabold text-slate-900 no-underline"><Activity size={27} className="text-sky-600"/><span className="hidden lg:inline">NHA KHOA ĐỨC TÍN</span></Link>
        <nav aria-label="Điều hướng chính" className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:justify-end">
          <Link to="/" className={linkClass('/')}>Trang chủ</Link>
          <Link to="/dich-vu" className={linkClass('/dich-vu')}>Dịch vụ</Link>
          <Link to="/su-kien" className={linkClass('/su-kien')}>Sự kiện & Ưu đãi</Link>
          {workspace&&<Link to={workspace.path} className={linkClass(workspace.path)}>{workspace.label}</Link>}
          </div>
          {user?<>
            <NotificationBell/>
            <Link to="/profile" aria-label="Hồ sơ cá nhân" title={`${user.HoTen} (${user.VaiTro})`} className="ml-2 inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 no-underline"><UserRound size={16}/><span className="hidden max-w-32 truncate sm:inline">{user.HoTen}</span></Link>
            <button type="button" aria-label="Đăng xuất" onClick={()=>{authService.logout();navigate('/login');}} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"><LogOut size={16}/><span className="hidden sm:inline">Đăng xuất</span></button>
          </>:<Link to="/login" className="ml-2 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white no-underline"><LogIn size={16}/>Đăng nhập</Link>}
        </nav>
      </div>
    </header>
    <main className="mx-auto w-full max-w-300 flex-1 px-6 py-10">{children}</main>
    <footer className="bg-slate-900 text-slate-400 [padding:40px_24px_20px_24px] [border-top:1px_solid_#1e293b]">
        <div className="max-w-300 mx-auto my-0 grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-[30px] mb-[30px] text-left">
          <div>
            <h3 className="text-white mb-3">Nha Khoa Đức Tín</h3>
            <p className="text-[14px] leading-[1.6]">
              Hệ thống nha khoa uy tín hàng đầu, ứng dụng Trợ lý Trí tuệ Nhân
              tạo hỗ trợ phân tích và quản lý hồ sơ bệnh án chuẩn xác.
            </p>
          </div>
          <div>
            <h4 className="text-white mb-3">Liên hệ & Thời gian</h4>
            <p className="text-[14px] leading-[1.6]">
              📍 54 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng
            </p>
            <p className="text-[14px] leading-[1.6]">📞 0236 388 888 - 0905 000 001</p>
            <p className="text-[14px] leading-[1.6]">✉️ contact@nhakhoaductin.com</p>
          </div>
          <div>
            <h4 className="text-white mb-3">Dịch vụ chính</h4>
            <p className="text-[14px] leading-[1.6]">• Nhổ răng khôn Piezotome không đau</p>
            <p className="text-[14px] leading-[1.6]">• Cấy ghép Implant tức thì</p>
            <p className="text-[14px] leading-[1.6]">• Niềng răng thẩm mỹ Invisalign</p>
            <p className="text-[14px] leading-[1.6]">• Tẩy trắng răng công nghệ Laser</p>
          </div>
        </div>
        <div className="[border-top:1px_solid_#1e293b] pt-5 text-center text-[13px]">
          © 2026 Đồ án tốt nghiệp Hệ thống Quản lý Nha khoa Đức Tín. All rights
          reserved.
        </div>
      </footer>
  </div>;
}
