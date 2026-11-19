import {PublicEventCard} from '../../../components/management/PublicEventCard';
import React from "react";
import { useClinic } from "../../../hooks/useClinic";
import { Tag } from "lucide-react";
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
              <PublicEventCard key={ev.IdSuKien || index} event={ev} timeLabel={timeDisplay} actionLabel="Tham gia ngay" onAction={()=>handleJoinEvent(ev.TieuDe)}/>
              );
          })}
        </div>
      )}
    </div>
  );
}
