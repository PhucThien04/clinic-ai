import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClinic } from "../../hooks/useClinic";
import { authService } from "../../services/authService";
import { formatDateTime } from "../../utils/dateUtils";
import {
  Sparkles,
  Clock,
  MapPin,
  Stethoscope,
  ArrowRight,
  Tag,
  Shield,
  Award,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./Home.css";

export default function Home(): React.JSX.Element {
  const { services, events, loading } = useClinic();
  const [serviceIndex, setServiceIndex] = useState<number>(0);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const ITEMS_PER_SLIDE = 4;
  const totalSlides = Math.ceil(services.length / ITEMS_PER_SLIDE) || 1;
  const visibleServices = services.slice(
    serviceIndex * ITEMS_PER_SLIDE,
    (serviceIndex + 1) * ITEMS_PER_SLIDE,
  );

  const handleNextService = () => {
    setServiceIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevService = () => {
    setServiceIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNavigation = (defaultReason: string) => {
    if (!currentUser) {
      navigate("/login");
    } else {
      navigate("/patient-appointments", { state: { defaultReason } });
    }
  };

  return (
    <div className="home-container">
      {/* 1. Hero Banner */}
      <section className="hero-section">
        <div>
          <div className="hero-badge">
            <Sparkles size={16} /> Phòng Khám Nha Khoa Chuẩn Quốc Tế & AI Cảnh
            Báo Lâm Sàng
          </div>

          <h1 className="hero-title">
            Nụ Cười Rạng Rỡ — Khởi Đầu Cho Cuộc Sống Hạnh Phúc
          </h1>

          <p className="hero-description">
            Nha khoa Đức Tín tiên phong ứng dụng công nghệ hiện đại và Trợ lý AI
            hỗ trợ theo dõi hồ sơ bệnh án toàn diện, mang lại giải pháp chăm sóc
            răng miệng an toàn, nhẹ nhàng và chính xác.
          </p>

          <div className="hero-actions">
            <button
              onClick={() => handleNavigation("Đăng ký khám tổng quát")}
              className="btn-hero-primary"
            >
              <PhoneCall size={18} /> Đặt Lịch Khám Ngay
            </button>
            <Link to="/dich-vu" className="btn-hero-secondary">
              Xem Dịch Vụ <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Card Thống kê nhanh */}
        <div className="hero-card">
          <div className="hero-card-header">
            <div className="hero-card-icon">
              <PhoneCall size={24} color="#0284c7" />
            </div>
            <div>
              <div className="hero-card-info-title">Tư vấn nhanh miễn phí</div>
              <div className="hero-card-info-phone">0236 388 888</div>
            </div>
          </div>

          <div className="hero-card-grid">
            <div className="hero-card-item">
              <Clock size={16} /> 08:00 - 20:00
            </div>
            <div className="hero-card-item">
              <Award size={16} /> Bác sĩ chuyên khoa
            </div>
            <div className="hero-card-item">
              <Shield size={16} /> Vô trùng tuyệt đối
            </div>
            <div className="hero-card-item">
              <Sparkles size={16} /> AI Hỗ trợ chẩn đoán
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sự Kiện & Ưu Đãi */}
      {events.length > 0 && (
        <section>
          <div className="section-header-wrapper">
            <div className="section-header">
              <Tag color="#0284c7" size={24} />
              <h2 className="section-title">Chương Trình Ưu Đãi & Sự Kiện</h2>
            </div>
            <Link to="/su-kien" className="btn-outline view-all-btn">
              Xem tất cả sự kiện ({events.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="event-list">
            {events.slice(0, 3).map((ev, index) => {
              const start = formatDateTime(ev.ThoiGianBatDau);
              const end = formatDateTime(ev.ThoiGianKetThuc);
              const timeDisplay =
                start && end ? `Từ ${start} đến ${end}` : "Đang diễn ra";

              return (
                <div key={ev.IdSuKien || index} className="event-card">
                  <div>
                    <span className="event-badge">
                      <Clock size={12} /> {timeDisplay}
                    </span>
                    <h3 className="event-title">{ev.TieuDe}</h3>
                    <p className="event-content">{ev.NoiDung}</p>
                  </div>
                  <button
                    onClick={() =>
                      handleNavigation(`Tham gia sự kiện: ${ev.TieuDe}`)
                    }
                    className="btn-primary event-action-btn"
                  >
                    Nhận ưu đãi ngay
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Carousel Dịch Vụ */}
      <section>
        <div className="section-header-wrapper">
          <div>
            <h2 className="section-centered-title">
              Dịch Vụ Nha Khoa Chuyên Sâu
            </h2>
            <p className="section-centered-subtitle">
              {loading
                ? "Đang tải danh mục dịch vụ..."
                : "Đội ngũ bác sĩ nhiều năm kinh nghiệm cùng hệ thống thiết bị đạt chuẩn Y tế"}
            </p>
          </div>
          <Link to="/dich-vu" className="btn-primary view-all-btn">
            Xem tất cả dịch vụ ({services.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="carousel-wrapper">
          {totalSlides > 1 && (
            <button
              onClick={handlePrevService}
              className="carousel-arrow carousel-arrow-prev"
              title="Dịch vụ trước"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div className="services-grid">
            {visibleServices.map((service, index) => (
              <div key={service.IdDichVu || index} className="service-card">
                <div>
                  <div className="service-icon-wrapper">
                    <Stethoscope size={24} color="#0284c7" />
                  </div>
                  <h3 className="service-title">{service.TenDichVu}</h3>
                  <p className="service-desc">{service.MoTa}</p>
                </div>
                <div className="service-footer">
                  <div className="service-price-wrapper">
                    <span className="service-price-label">Chi phí từ:</span>
                    <span className="service-price-val">
                      {Number(service.Gia || 0).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleNavigation(`Đăng ký dịch vụ: ${service.TenDichVu}`)
                    }
                    className="btn-primary service-action-btn"
                  >
                    Đặt lịch dịch vụ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalSlides > 1 && (
            <button
              onClick={handleNextService}
              className="carousel-arrow carousel-arrow-next"
              title="Dịch vụ kế tiếp"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      </section>

      {/* 4. Giới Thiệu Phòng Khám & Ứng Dụng AI */}
      <section className="intro-card">
        <div>
          <span className="intro-category">Giới thiệu phòng khám</span>
          <h2 className="intro-title">
            Nha Khoa Đức Tín — Chăm Sóc Nụ Cười Việt
          </h2>
          <p className="intro-paragraph">
            Tọa lạc tại vị trí đắc địa ở thành phố Đà Nẵng, phòng khám Nha khoa
            Đức Tín cung cấp đầy đủ các dịch vụ từ kiểm tra tổng quát, điều trị
            nha khoa tới thẩm mỹ nụ cười.
          </p>
          <p className="intro-paragraph">
            Hệ thống tích hợp <strong>Trợ lý AI</strong> tiên tiến giúp tổng hợp
            tiền sử bệnh lý, cảnh báo sớm các dấu hiệu bất thường, hỗ trợ các
            bác sĩ đưa ra phác đồ điều trị tối ưu nhất.
          </p>

          <div className="intro-details">
            <div className="intro-detail-item">
              <MapPin size={18} color="#0284c7" /> Địa chỉ: 54 Nguyễn Lương
              Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng
            </div>
            <div className="intro-detail-item">
              <Clock size={18} color="#0284c7" /> Mở cửa: 08:00 AM – 08:00 PM
              (Từ thứ 2 đến Chủ Nhật)
            </div>
          </div>
        </div>

        <div className="ai-card">
          <div className="ai-icon-wrapper">
            <Sparkles size={32} color="#0d9488" />
          </div>
          <h3 className="ai-title">Trợ Lý AI Phân Tích Bệnh Án</h3>
          <p className="ai-desc">
            Tự động tóm tắt tiền sử bệnh án, phân tích sinh hiệu lâm sàng và đưa
            ra cảnh báo sớm hỗ trợ bác sĩ chuyên khoa.
          </p>
          <div className="ai-note">
            (Tính năng lâm sàng dành cho Bác sĩ & Y tá)
          </div>
        </div>
      </section>
    </div>
  );
}
