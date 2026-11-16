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
import "./DashboardLayout.css";

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
    <div className="dashboard-wrapper">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo-link">
            <div className="sidebar-logo-icon">
              <Activity color="white" size={20} />
            </div>
            <span className="sidebar-logo-text">HỆ THỐNG Y TẾ</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link sidebar-link-default">
            <Home size={18} /> Về trang chủ
          </Link>

          {(isPatient || currentUser.VaiTro === "Admin") && (
            <>
              <div className="sidebar-section-title">Dịch vụ cá nhân</div>
              <Link
                to="/patient-appointments"
                className={`sidebar-link ${isActive("/patient-appointments") ? "sidebar-link-active" : "sidebar-link-default"}`}
              >
                <Calendar size={18} /> Đặt lịch khám
              </Link>
              <Link
                to="/patient-history"
                className={`sidebar-link ${isActive("/patient-history") ? "sidebar-link-active" : "sidebar-link-default"}`}
              >
                <FileText size={18} /> Hồ sơ & Lịch sử
              </Link>
            </>
          )}

          {(isNurse || isDoctor) && (
            <div className="sidebar-section-title">Nghiệp vụ lâm sàng</div>
          )}

          {isNurse && (
            <Link
              to="/nurse"
              className={`sidebar-link ${isActive("/nurse") ? "sidebar-link-active" : "sidebar-link-default"}`}
            >
              <HeartPulse size={18} /> Bàn làm việc Y tá
            </Link>
          )}

          {isDoctor && (
            <Link
              to="/doctor"
              className={`sidebar-link ${isActive("/doctor") ? "sidebar-link-doctor-active" : "sidebar-link-default"}`}
            >
              <Stethoscope size={18} /> Phòng khám Bác sĩ
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-profile-link">
            <div className="sidebar-avatar">
              <Users size={18} color="#0284c7" />
            </div>
            <div>
              <div className="sidebar-profile-name">{currentUser?.HoTen}</div>
              <div className="sidebar-profile-desc">Xem hồ sơ cá nhân</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="btn sidebar-btn-logout">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
