import React from "react";
import { useClinic } from "../../../hooks/useClinic";
import { Stethoscope, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";


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
    <div className="flex flex-col gap-[30px] p-5">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-600 [padding:6px_16px] rounded-[30px] text-[13px] font-semibold mb-3">
          <Stethoscope size={16} /> Danh Mục Dịch Vụ Nha Khoa Chuyên Sâu
        </div>
        <h1 className="text-[32px] text-slate-900 font-extrabold">
          Tất Cả Dịch Vụ Tại Nha Khoa Đức Tín
        </h1>
        <p className="text-slate-500 text-[15px] mt-2">
          Cam kết dịch vụ chất lượng cao, thiết bị hiện đại và đội ngũ bác sĩ
          chuyên khoa giàu kinh nghiệm.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-10 text-slate-500">
          Đang tải danh sách dịch vụ...
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-6">
          {services.map((service, index) => (
            <div
              key={service.IdDichVu || index}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between p-5 bg-white rounded-[12px] [border:1px_solid_#e2e8f0]"
            >
              <div>
                <div className="w-12 h-12 [background:linear-gradient(135deg,_#e0f2fe_0%,_#ccfbf1_100%)] rounded-[12px] flex items-center justify-center mb-4">
                  <Stethoscope size={24} color="#0284c7" />
                </div>
                <h3 className="text-[18px] text-slate-900 mb-2">{service.TenDichVu}</h3>
                <p className="text-slate-500 text-[14px] leading-[1.6] mb-4">{service.MoTa}</p>
              </div>
              <div className="[border-top:1px_solid_#f1f5f9] pt-4 flex justify-between items-center">
                <div>
                  <div className="text-[12px] text-slate-400">
                    Chi phí niêm yết:
                  </div>
                  <div className="text-[18px] font-extrabold text-teal-600">
                    {Number(service.Gia || 0).toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
                <button
                  onClick={() => handleBookService(service.TenDichVu)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [padding:8px_14px] text-[13px] cursor-pointer bg-sky-600 text-white [border:none] rounded-[6px] flex items-center gap-1"
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
