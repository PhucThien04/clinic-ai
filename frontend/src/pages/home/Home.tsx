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
    <div className="flex flex-col gap-[50px] w-full box-border [&_*]:box-border max-[640.01px]:gap-[35px]">
      {/* 1. Hero Banner */}
      <section className="[padding:50px_30px] [background:linear-gradient(135deg,_#0284c7_0%,_#0d9488_100%)] rounded-[24px] text-white [box-shadow:0_20px_25px_-5px_rgba(2,_132,_199,_0.25)] grid grid-cols-[1.2fr_0.8fr] gap-[30px] items-center max-[1024.01px]:grid-cols-[1fr_0.8fr] max-[1024.01px]:[padding:40px_24px] max-[900.01px]:grid-cols-[1fr] max-[640.01px]:[padding:30px_20px] max-[640.01px]:rounded-[16px]">
        <div>
          <div className="inline-flex items-center gap-2 [background:rgba(255,_255,_255,_0.2)] [padding:6px_16px] rounded-[30px] text-[13px] font-semibold mb-5 max-[400.01px]:text-[11px]">
            <Sparkles size={16} /> Phòng Khám Nha Khoa Chuẩn Quốc Tế & AI Cảnh
            Báo Lâm Sàng
          </div>

          <h1 className="text-[38px] text-white! [margin:0_0_16px] font-extrabold leading-[1.2]! max-[1024.01px]:text-[32px] max-[640.01px]:text-[28px] max-[400.01px]:text-[24px]">
            Nụ Cười Rạng Rỡ — Khởi Đầu Cho Cuộc Sống Hạnh Phúc
          </h1>

          <p className="text-[16px] text-sky-100 mb-[30px] leading-[1.6]">
            Nha khoa Đức Tín tiên phong ứng dụng công nghệ hiện đại và Trợ lý AI
            hỗ trợ theo dõi hồ sơ bệnh án toàn diện, mang lại giải pháp chăm sóc
            răng miệng an toàn, nhẹ nhàng và chính xác.
          </p>

          <div className="flex items-center gap-4 flex-wrap max-[640.01px]:flex-col max-[640.01px]:items-stretch">
            <button
              onClick={() => handleNavigation("Đăng ký khám tổng quát")}
              className="bg-white text-sky-600 [padding:14px_28px] text-[15px] font-bold cursor-pointer [border:none] rounded-[8px] inline-flex items-center justify-center gap-2 [transition:all_0.2s_ease] [&:hover]:bg-sky-100 [&:hover]:[transform:translateY(-2px)] max-[640.01px]:w-full"
            >
              <PhoneCall size={18} /> Đặt Lịch Khám Ngay
            </button>
            <Link to="/dich-vu" className="[background:rgba(255,_255,_255,_0.15)] text-white [padding:14px_24px] text-[15px] no-underline rounded-[8px] inline-flex items-center justify-center gap-2 [transition:all_0.2s_ease] [&:hover]:[background:rgba(255,_255,_255,_0.25)] [&:hover]:[transform:translateY(-2px)] max-[640.01px]:w-full">
              Xem Dịch Vụ <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Card Thống kê nhanh */}
        <div className="[background:rgba(255,_255,_255,_0.1)] [backdrop-filter:blur(10px)] p-6 rounded-[16px] [border:1px_solid_rgba(255,_255,_255,_0.2)] flex flex-col gap-5 max-[640.01px]:p-[18px]">
          <div className="flex items-center gap-3">
            <div className="bg-white p-[10px] rounded-[12px] flex">
              <PhoneCall size={24} color="#0284c7" />
            </div>
            <div>
              <div className="text-[12px] text-sky-100">Tư vấn nhanh miễn phí</div>
              <div className="text-[20px] font-extrabold">0236 388 888</div>
            </div>
          </div>

          <div className="[border-top:1px_solid_rgba(255,_255,_255,_0.2)] pt-[15px] grid grid-cols-[1fr_1fr] gap-3 text-[13px] max-[400.01px]:grid-cols-[1fr]">
            <div className="flex items-center gap-[6px]">
              <Clock size={16} /> 08:00 - 20:00
            </div>
            <div className="flex items-center gap-[6px]">
              <Award size={16} /> Bác sĩ chuyên khoa
            </div>
            <div className="flex items-center gap-[6px]">
              <Shield size={16} /> Vô trùng tuyệt đối
            </div>
            <div className="flex items-center gap-[6px]">
              <Sparkles size={16} /> AI Hỗ trợ chẩn đoán
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sự Kiện & Ưu Đãi */}
      {events.length > 0 && (
        <section>
          <div className="flex justify-between items-end gap-5 mb-6 max-[900.01px]:flex-col max-[900.01px]:items-start max-[900.01px]:gap-3">
            <div className="flex items-center gap-[10px]">
              <Tag color="#0284c7" size={24} />
              <h2 className="text-[24px] text-slate-900 m-0 max-[640.01px]:text-[20px]">Chương Trình Ưu Đãi & Sự Kiện</h2>
            </div>
            <Link to="/su-kien" className="border border-slate-300 bg-white text-slate-900 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600 text-[13px] inline-flex items-center justify-center gap-[6px] no-underline [padding:8px_16px] rounded-[6px] [white-space:nowrap] [transition:all_0.2s_ease] max-[640.01px]:[white-space:normal]">
              Xem tất cả sự kiện ({events.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {events.slice(0, 3).map((ev, index) => {
              const start = formatDateTime(ev.ThoiGianBatDau);
              const end = formatDateTime(ev.ThoiGianKetThuc);
              const timeDisplay =
                start && end ? `Từ ${start} đến ${end}` : "Đang diễn ra";

              return (
                <div key={ev.IdSuKien || index} className="[background:linear-gradient(90deg,_#f0f9ff_0%,_#ffffff_100%)] [border-left:6px_solid_#0284c7] [padding:20px_24px] rounded-[12px] flex justify-between items-center gap-5 [box-shadow:0_2px_4px_rgba(0,_0,_0,_0.04)] [transition:all_0.2s_ease] [&:hover]:[box-shadow:0_5px_12px_rgba(2,_132,_199,_0.1)] [&:hover]:[transform:translateY(-2px)] max-[900.01px]:items-start max-[640.01px]:flex-col max-[640.01px]:items-stretch max-[640.01px]:p-[18px]">
                  <div>
                    <span className="inline-flex items-center gap-[6px] bg-sky-600 text-white text-[12px] font-bold [padding:4px_12px] rounded-[20px] mb-2">
                      <Clock size={12} /> {timeDisplay}
                    </span>
                    <h3 className="text-[18px] text-sky-700 [margin:4px_0_6px] leading-[1.3]!">{ev.TieuDe}</h3>
                    <p className="text-slate-600 text-[14px] leading-[1.5] m-0">{ev.NoiDung}</p>
                  </div>
                  <button
                    onClick={() =>
                      handleNavigation(`Tham gia sự kiện: ${ev.TieuDe}`)
                    }
                    className="[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [white-space:nowrap] cursor-pointer bg-sky-600 text-white [border:none] [padding:10px_16px] rounded-[6px] font-semibold [transition:all_0.2s_ease] [&:hover]:bg-sky-700 max-[640.01px]:w-full"
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
        <div className="flex justify-between items-end gap-5 mb-6 max-[900.01px]:flex-col max-[900.01px]:items-start max-[900.01px]:gap-3">
          <div>
            <h2 className="text-[28px] text-slate-900 [margin:0_0_6px] text-left max-[640.01px]:text-[24px]">
              Dịch Vụ Nha Khoa Chuyên Sâu
            </h2>
            <p className="text-slate-500 text-[15px] text-left m-0">
              {loading
                ? "Đang tải danh mục dịch vụ..."
                : "Đội ngũ bác sĩ nhiều năm kinh nghiệm cùng hệ thống thiết bị đạt chuẩn Y tế"}
            </p>
          </div>
          <Link to="/dich-vu" className="bg-sky-600 border border-sky-600 text-white cursor-pointer font-medium hover:bg-sky-700 text-[13px] inline-flex items-center justify-center gap-[6px] no-underline [padding:8px_16px] rounded-[6px] [white-space:nowrap] [transition:all_0.2s_ease] max-[640.01px]:[white-space:normal]">
            Xem tất cả dịch vụ ({services.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="relative w-full [padding:0_60px] box-border max-[640.01px]:[padding:0_40px]">
          {totalSlides > 1 && (
            <button
              onClick={handlePrevService}
              className="absolute [top:50%] [transform:translateY(-50%)] [z-index:10] w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white [border:1px_solid_#cbd5e1] text-sky-600 cursor-pointer [box-shadow:0_4px_6px_-1px_rgba(0,_0,_0,_0.1)] [transition:all_0.2s_ease] [&:hover:not(:disabled)]:bg-sky-600 [&:hover:not(:disabled)]:text-white [&:hover:not(:disabled)]:border-sky-600 [&:hover:not(:disabled)]:[transform:translateY(-50%)_scale(1.08)] [&:disabled]:[opacity:0.25] [&:disabled]:cursor-not-allowed [&:disabled]:[box-shadow:none] max-[640.01px]:w-9 max-[640.01px]:h-9 [left:0]"
              title="Dịch vụ trước"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div className="grid grid-cols-[repeat(4,_minmax(0,_1fr))] auto-rows-[342px] gap-5 items-stretch max-[1024.01px]:grid-cols-[repeat(2,_minmax(0,_1fr))] max-[640.01px]:grid-cols-[1fr] max-[640.01px]:auto-rows-[342px]">
            {visibleServices.map((service, index) => (
              <div key={service.IdDichVu || index} className="flex flex-col justify-between w-full h-[342px] min-h-[342px] min-w-0 p-5 box-border bg-white rounded-[12px] [border:1px_solid_#e2e8f0] [box-shadow:0_4px_6px_-1px_rgba(0,_0,_0,_0.08)] [transition:all_0.2s_ease] [&:hover]:[transform:translateY(-3px)] [&:hover]:[box-shadow:0_8px_15px_rgba(2,_132,_199,_0.12)] max-[640.01px]:h-[342px] max-[640.01px]:min-h-[342px]">
                <div>
                  <div className="w-12 h-12 shrink-0 bg-sky-100 rounded-[10px] flex items-center justify-center mb-4">
                    <Stethoscope size={24} color="#0284c7" />
                  </div>
                  <h3 className="text-[18px] text-slate-900 [margin:0_0_8px] leading-[1.35]">{service.TenDichVu}</h3>
                  <p className="text-slate-500 text-[14px] [margin:0_0_16px] leading-[1.5]">{service.MoTa}</p>
                </div>
                <div className="[border-top:1px_solid_#f1f5f9] pt-3 flex flex-col gap-[10px]">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[13px] text-slate-500 [white-space:nowrap]">Chi phí từ:</span>
                    <span className="text-[16px] font-extrabold text-teal-600 text-right max-[400.01px]:text-[14px]">
                      {Number(service.Gia || 0).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleNavigation(`Đăng ký dịch vụ: ${service.TenDichVu}`)
                    }
                    className="[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 w-full [padding:9px_8px] bg-sky-600 text-white [border:none] rounded-[6px] font-semibold cursor-pointer text-[13px] [transition:all_0.2s_ease] [&:hover]:bg-sky-700"
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
              className="absolute [top:50%] [transform:translateY(-50%)] [z-index:10] w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white [border:1px_solid_#cbd5e1] text-sky-600 cursor-pointer [box-shadow:0_4px_6px_-1px_rgba(0,_0,_0,_0.1)] [transition:all_0.2s_ease] [&:hover:not(:disabled)]:bg-sky-600 [&:hover:not(:disabled)]:text-white [&:hover:not(:disabled)]:border-sky-600 [&:hover:not(:disabled)]:[transform:translateY(-50%)_scale(1.08)] [&:disabled]:[opacity:0.25] [&:disabled]:cursor-not-allowed [&:disabled]:[box-shadow:none] max-[640.01px]:w-9 max-[640.01px]:h-9 [right:0]"
              title="Dịch vụ kế tiếp"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      </section>

      {/* 4. Giới Thiệu Phòng Khám & Ứng Dụng AI */}
      <section className="p-9 bg-white grid grid-cols-[1fr_1fr] gap-[30px] items-center rounded-[12px] [border:1px_solid_#e2e8f0] [box-shadow:0_4px_10px_rgba(15,_23,_42,_0.04)] max-[1024.01px]:gap-5 max-[1024.01px]:p-7 max-[900.01px]:grid-cols-[1fr] max-[640.01px]:[padding:24px_18px]">
        <div>
          <span className="text-sky-600 font-bold text-[14px] uppercase">Giới thiệu phòng khám</span>
          <h2 className="text-[26px] text-slate-900 [margin:8px_0_16px] leading-[1.3] max-[640.01px]:text-[23px]">
            Nha Khoa Đức Tín — Chăm Sóc Nụ Cười Việt
          </h2>
          <p className="text-slate-600 text-[14px] leading-[1.7] mb-4">
            Tọa lạc tại vị trí đắc địa ở thành phố Đà Nẵng, phòng khám Nha khoa
            Đức Tín cung cấp đầy đủ các dịch vụ từ kiểm tra tổng quát, điều trị
            nha khoa tới thẩm mỹ nụ cười.
          </p>
          <p className="text-slate-600 text-[14px] leading-[1.7] mb-4">
            Hệ thống tích hợp <strong>Trợ lý AI</strong> tiên tiến giúp tổng hợp
            tiền sử bệnh lý, cảnh báo sớm các dấu hiệu bất thường, hỗ trợ các
            bác sĩ đưa ra phác đồ điều trị tối ưu nhất.
          </p>

          <div className="flex flex-col gap-[10px] text-[14px] text-slate-700">
            <div className="flex items-start gap-2 leading-[1.6] [&_svg]:shrink-0 [&_svg]:mt-[2px]">
              <MapPin size={18} color="#0284c7" /> Địa chỉ: 54 Nguyễn Lương
              Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng
            </div>
            <div className="flex items-start gap-2 leading-[1.6] [&_svg]:shrink-0 [&_svg]:mt-[2px]">
              <Clock size={18} color="#0284c7" /> Mở cửa: 08:00 AM – 08:00 PM
              (Từ thứ 2 đến Chủ Nhật)
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-[30px] rounded-[16px] [border:1px_solid_#e2e8f0] text-center max-[640.01px]:[padding:24px_18px]">
          <div className="w-15 h-15 bg-teal-100 rounded-full flex items-center justify-center [margin:0_auto_16px]">
            <Sparkles size={32} color="#0d9488" />
          </div>
          <h3 className="text-[20px] text-slate-900 [margin:0_0_10px]">Trợ Lý AI Phân Tích Bệnh Án</h3>
          <p className="text-slate-500 text-[14px] leading-[1.6] mb-5">
            Tự động tóm tắt tiền sử bệnh án, phân tích sinh hiệu lâm sàng và đưa
            ra cảnh báo sớm hỗ trợ bác sĩ chuyên khoa.
          </p>
          <div className="text-teal-600 font-semibold text-[14px]">
            (Tính năng lâm sàng dành cho Bác sĩ & Y tá)
          </div>
        </div>
      </section>
    </div>
  );
}
