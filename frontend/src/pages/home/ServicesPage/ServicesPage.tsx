import React from "react";
import { useClinic } from "../../../hooks/useClinic";
import { Stethoscope, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import "./ServicesPage.css";

export default function ServicesPage(): React.JSX.Element {
  const { services, loading } = useClinic();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleBookService = (serviceName: string) => {
    if (!currentUser) navigate("/login");
    else
      navigate("/patient-appointments", {
        state: { defaultReason: `Đăng ký dịch vụ: ${serviceName}` },
      });
  };

  return (
    <div className="services-page-container">
      <div className="services-page-header">
        <div className="services-page-badge">
          <Stethoscope size={16} /> Danh Mục Dịch Vụ Nha Khoa Chuyên Sâu
        </div>
        <h1 className="services-page-title">
          Tất Cả Dịch Vụ Tại Nha Khoa Đức Tín
        </h1>
        <p className="services-page-subtitle">
          Cam kết dịch vụ chất lượng cao, thiết bị hiện đại và đội ngũ bác sĩ
          chuyên khoa giàu kinh nghiệm.
        </p>
      </div>

      {loading ? (
        <div className="services-page-loading">
          Đang tải danh sách dịch vụ...
        </div>
      ) : (
        <div className="services-page-grid">
          {services.map((service, index) => (
            <div
              key={service.IdDichVu || index}
              className="card service-page-card"
            >
              <div>
                <div className="service-page-icon">
                  <Stethoscope size={24} color="#0284c7" />
                </div>
                <h3 className="service-page-card-title">{service.TenDichVu}</h3>
                <p className="service-page-card-desc">{service.MoTa}</p>
              </div>
              <div className="service-page-footer">
                <div>
                  <div className="service-page-price-label">
                    Chi phí niêm yết:
                  </div>
                  <div className="service-page-price-val">
                    {Number(service.Gia || 0).toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
                <button
                  onClick={() => handleBookService(service.TenDichVu)}
                  className="btn btn-primary service-page-btn"
                >
                  Đặt lịch <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
