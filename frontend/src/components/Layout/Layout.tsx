import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import {
  Activity,
  LogOut,
  LogIn,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Phone,
} from "lucide-react";


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };
  const isActive = (path: string) => location.pathname === path;

  const isNurse =
    currentUser?.VaiTro === "Y tá" ||
    currentUser?.VaiTro === "Admin" ||
    currentUser?.VaiTro === "Chủ phòng khám";
  const isDoctor =
    currentUser?.VaiTro === "Bác sĩ" ||
    currentUser?.VaiTro === "Admin" ||
    currentUser?.VaiTro === "Chủ phòng khám";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-900 text-slate-400 text-[13px] [padding:6px_24px]">
        <div className="max-w-300 mx-auto my-0 flex justify-between items-center">
          <div className="flex gap-5">
            <span className="flex items-center gap-[6px]">
              <Phone size={14} color="#0284c7" /> Hotline: 0236 388 888
            </span>
            <span>📍 Địa chỉ: 54 Nguyễn Lương Bằng, Đà Nẵng</span>
          </div>
          <div>⏰ Giờ mở cửa: 08:00 - 20:00 (Hằng ngày)</div>
        </div>
      </div>

      <header className="bg-white [border-bottom:1px_solid_#e2e8f0] sticky top-0 [z-index:50] [box-shadow:0_1px_3px_0_rgb(0_0_0_/_0.05)]">
        <div className="max-w-300 mx-auto my-0 [padding:12px_24px] flex justify-between items-center">
          <Link to="/" className="no-underline flex items-center gap-[10px]">
            <div className="[background:linear-gradient(135deg,_#0284c7,_#0d9488)] p-2 rounded-[10px] flex">
              <Activity color="white" size={24} />
            </div>
            <div>
              <span className="font-extrabold text-[18px] text-slate-900 [letter-spacing:-0.5px]">NHA KHOA </span>
              <span className="font-extrabold text-[18px] text-sky-600">ĐỨC TÍN</span>
            </div>
          </Link>

          <nav className="flex gap-[6px] items-center">
            <Link
              to="/"
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [border:none] ${isActive("/") ? "[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700" : "border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600"}`}
            >
              Trang chủ
            </Link>
            <Link
              to="/dich-vu"
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [border:none] ${isActive("/dich-vu") ? "[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700" : "border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600"}`}
            >
              Dịch vụ
            </Link>
            <Link
              to="/su-kien"
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [border:none] ${isActive("/su-kien") ? "[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700" : "border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600"}`}
            >
              Sự kiện & Ưu đãi
            </Link>

            {isNurse && (
              <Link
                to="/nurse"
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [border:none] border-sky-600 text-sky-600 ${isActive("/nurse") ? "[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700" : "border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600"}`}
              >
                <HeartPulse size={16} /> Bàn làm việc Y tá
              </Link>
            )}

            {isDoctor && (
              <Link
                to="/doctor"
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [border:none] border-teal-600 text-teal-600 ${isActive("/doctor") ? "[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700" : "border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600"}`}
              >
                <Stethoscope size={16} /> Phòng khám Bác sĩ
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3 ml-3 pl-3 [border-left:1px_solid_#e2e8f0]">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 bg-slate-100 [padding:6px_12px] rounded-[20px] no-underline cursor-pointer [transition:background_0.2s] [&:hover]:bg-slate-200"
                  title="Cập nhật thông tin cá nhân"
                >
                  <ShieldCheck size={16} color="#0284c7" />
                  <span className="text-[13px] font-semibold text-slate-700">
                    {currentUser.HoTen} ({currentUser.VaiTro})
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600 text-red-500 [border-color:#fca5a5]"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex gap-2 ml-3">
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700">
                  <LogIn size={16} /> Đăng nhập
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 [padding:40px_24px] max-w-300 w-full mx-auto my-0">{children}</main>

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
    </div>
  );
}
