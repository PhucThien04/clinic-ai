import React from "react";
import { useClinic } from "../../../hooks/useClinic";
import { Tag, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { formatDateTime } from "../../../utils/dateUtils";


export default function EventsPage(): React.JSX.Element {
  const { events, loading } = useClinic();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleJoinEvent = (eventTitle: string) => {
    if (!currentUser) {
      navigate("/login");
    } else {
      navigate("/patient-appointments", {
        state: { defaultReason: `Tham gia sự kiện: ${eventTitle}` },
      });
    }
  };

  return (
    <div className="flex flex-col gap-[30px] p-5">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-600 [padding:6px_16px] rounded-[30px] text-[13px] font-semibold mb-3">
          <Tag size={16} /> Tin Tức & Ưu Đãi Sự Kiện
        </div>
        <h1 className="text-[32px] text-slate-900 font-extrabold">Sự Kiện & Chương Trình Khuyến Mãi</h1>
        <p className="text-slate-500 text-[15px] mt-2">
          Cập nhật những ưu đãi mới nhất và hoạt động tri ân khách hàng từ Nha
          Khoa Đức Tín.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-10 text-slate-500">Đang tải danh sách sự kiện...</div>
      ) : (
        <div className="flex flex-col gap-5">
          {events.map((ev, index) => {
            const start = formatDateTime(ev.ThoiGianBatDau);
            const end = formatDateTime(ev.ThoiGianKetThuc);
            const timeDisplay =
              start && end ? `Từ ${start} đến ${end}` : "Đang diễn ra";

            return (
              <div key={ev.IdSuKien || index} className="[background:linear-gradient(90deg,_#f0f9ff_0%,_#ffffff_100%)] [border-left:6px_solid_#0284c7] p-6 flex justify-between items-center flex-wrap gap-4 rounded-[12px] [border:1px_solid_#e2e8f0]">
                <div className="max-w-200">
                  <div className="flex items-center gap-[10px] mb-2">
                    <span className="bg-sky-600 text-white text-[12px] font-bold [padding:4px_12px] rounded-[20px] inline-flex items-center gap-[6px]">
                      <Clock size={12} /> {timeDisplay}
                    </span>
                  </div>
                  <h2 className="text-[20px] text-sky-700 mb-[10px]">{ev.TieuDe}</h2>
                  <p className="text-slate-600 text-[15px] leading-[1.6]">{ev.NoiDung}</p>
                </div>
                <button
                  onClick={() => handleJoinEvent(ev.TieuDe)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [padding:12px_20px] text-[14px] [white-space:nowrap] cursor-pointer bg-sky-600 text-white [border:none] rounded-[6px] flex items-center gap-[6px]"
                >
                  Tham gia ngay <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
