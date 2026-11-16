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
import "./Layout.css";

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
    <div className="layout-wrapper">
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="top-bar-left">
            <span className="top-bar-item">
              <Phone size={14} color="#0284c7" /> Hotline: 0236 388 888
            </span>
            <span>📍 Địa chỉ: 54 Nguyễn Lương Bằng, Đà Nẵng</span>
          </div>
          <div>⏰ Giờ mở cửa: 08:00 - 20:00 (Hằng ngày)</div>
        </div>
      </div>

      <header className="main-header">
        <div className="main-header-inner">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <Activity color="white" size={24} />
            </div>
            <div>
              <span className="logo-text-1">NHA KHOA </span>
              <span className="logo-text-2">ĐỨC TÍN</span>
            </div>
          </Link>

          <nav className="nav-menu">
            <Link
              to="/"
              className={`btn nav-link ${isActive("/") ? "btn-primary" : "btn-outline"}`}
            >
              Trang chủ
            </Link>
            <Link
              to="/dich-vu"
              className={`btn nav-link ${isActive("/dich-vu") ? "btn-primary" : "btn-outline"}`}
            >
              Dịch vụ
            </Link>
            <Link
              to="/su-kien"
              className={`btn nav-link ${isActive("/su-kien") ? "btn-primary" : "btn-outline"}`}
            >
              Sự kiện & Ưu đãi
            </Link>

            {isNurse && (
              <Link
                to="/nurse"
                className={`btn nav-link nav-link-nurse ${isActive("/nurse") ? "btn-primary" : "btn-outline"}`}
              >
                <HeartPulse size={16} /> Bàn làm việc Y tá
              </Link>
            )}

            {isDoctor && (
              <Link
                to="/doctor"
                className={`btn nav-link nav-link-doctor ${isActive("/doctor") ? "btn-primary" : "btn-outline"}`}
              >
                <Stethoscope size={16} /> Phòng khám Bác sĩ
              </Link>
            )}

            {currentUser ? (
              <div className="user-menu">
                <Link
                  to="/profile"
                  className="user-profile-link"
                  title="Cập nhật thông tin cá nhân"
                >
                  <ShieldCheck size={16} color="#0284c7" />
                  <span className="user-name">
                    {currentUser.HoTen} ({currentUser.VaiTro})
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-logout"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="login-menu">
                <Link to="/login" className="btn btn-primary">
                  <LogIn size={16} /> Đăng nhập
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="main-footer">
        <div className="footer-inner">
          <div>
            <h3 className="footer-title">Nha Khoa Đức Tín</h3>
            <p className="footer-text">
              Hệ thống nha khoa uy tín hàng đầu, ứng dụng Trợ lý Trí tuệ Nhân
              tạo hỗ trợ phân tích và quản lý hồ sơ bệnh án chuẩn xác.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Liên hệ & Thời gian</h4>
            <p className="footer-text">
              📍 54 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng
            </p>
            <p className="footer-text">📞 0236 388 888 - 0905 000 001</p>
            <p className="footer-text">✉️ contact@nhakhoaductin.com</p>
          </div>
          <div>
            <h4 className="footer-title">Dịch vụ chính</h4>
            <p className="footer-text">• Nhổ răng khôn Piezotome không đau</p>
            <p className="footer-text">• Cấy ghép Implant tức thì</p>
            <p className="footer-text">• Niềng răng thẩm mỹ Invisalign</p>
            <p className="footer-text">• Tẩy trắng răng công nghệ Laser</p>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Đồ án tốt nghiệp Hệ thống Quản lý Nha khoa Đức Tín. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
