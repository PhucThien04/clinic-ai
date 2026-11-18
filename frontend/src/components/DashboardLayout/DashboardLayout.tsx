import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import {
  Activity,
  LogOut,
  HeartPulse,
  Stethoscope,
  Users,
  Home,
  Calendar,
  FileText,
} from "lucide-react";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };
  const isActive = (path: string) => location.pathname.startsWith(path);

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const isNurse =
    currentUser.VaiTro === "Y tá" ||
    currentUser.VaiTro === "Admin" ||
    currentUser.VaiTro === "Chủ phòng khám";
  const isDoctor =
    currentUser.VaiTro === "Bác sĩ" ||
    currentUser.VaiTro === "Admin" ||
    currentUser.VaiTro === "Chủ phòng khám";
  const isPatient = currentUser.VaiTro === "Bệnh nhân";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-65 shrink-0 h-screen sticky top-0 bg-white [border-right:1px_solid_#e2e8f0] flex flex-col">
        <div className="shrink-0 shrink-0 p-5 [border-bottom:1px_solid_#e2e8f0]">
          <Link to="/" className="no-underline flex items-center gap-[10px]">
            <div className="[background:linear-gradient(135deg,_#0284c7,_#0d9488)] p-[6px] rounded-[8px] flex">
              <Activity color="white" size={20} />
            </div>
            <span className="font-extrabold text-[16px] text-slate-900">HỆ THỐNG Y TẾ</span>
          </Link>
        </div>

        <nav className="p-5 flex flex-col gap-2 min-h-0 flex-1 overflow-y-auto">
          <Link to="/" className="flex items-center gap-3 [padding:10px_14px] rounded-[8px] no-underline font-semibold text-slate-500 [background:transparent]">
            <Home size={18} /> Về trang chủ
          </Link>

          {(isPatient || currentUser.VaiTro === "Admin") && (
            <>
              <div className="[margin:15px_0_5px_0] text-[11px] font-bold text-slate-400 uppercase [letter-spacing:0.5px]">Dịch vụ cá nhân</div>
              <Link
                to="/patient-appointments"
                className={`flex items-center gap-3 [padding:10px_14px] rounded-[8px] no-underline font-semibold ${isActive("/patient-appointments") ? "text-sky-600 bg-sky-100" : "text-slate-500 [background:transparent]"}`}
              >
                <Calendar size={18} /> Đặt lịch khám
              </Link>
              <Link
                to="/patient-history"
                className={`flex items-center gap-3 [padding:10px_14px] rounded-[8px] no-underline font-semibold ${isActive("/patient-history") ? "text-sky-600 bg-sky-100" : "text-slate-500 [background:transparent]"}`}
              >
                <FileText size={18} /> Hồ sơ & Lịch sử
              </Link>
            </>
          )}

          {(isNurse || isDoctor) && (
            <div className="[margin:15px_0_5px_0] text-[11px] font-bold text-slate-400 uppercase [letter-spacing:0.5px]">Nghiệp vụ lâm sàng</div>
          )}

          {isNurse && (
            <Link
              to="/nurse"
              className={`flex items-center gap-3 [padding:10px_14px] rounded-[8px] no-underline font-semibold ${isActive("/nurse") ? "text-sky-600 bg-sky-100" : "text-slate-500 [background:transparent]"}`}
            >
              <HeartPulse size={18} /> Bàn làm việc Y tá
            </Link>
          )}

          {isDoctor && (
            <Link
              to="/doctor"
              className={`flex items-center gap-3 [padding:10px_14px] rounded-[8px] no-underline font-semibold ${isActive("/doctor") ? "text-teal-600 bg-teal-100" : "text-slate-500 [background:transparent]"}`}
            >
              <Stethoscope size={18} /> Phòng khám Bác sĩ
            </Link>
          )}
        </nav>

        <div className="shrink-0 shrink-0 p-5 [border-top:1px_solid_#e2e8f0] bg-white">
          <Link to="/profile" className="flex items-center gap-[10px] mb-[15px] no-underline">
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
              <Users size={18} color="#0284c7" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800">{currentUser?.HoTen}</div>
              <div className="text-[12px] text-slate-500">Xem hồ sơ cá nhân</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 w-full bg-red-100 text-red-500 p-2 text-[13px]">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 [padding:30px_40px]">{children}</main>
    </div>
  );
}
