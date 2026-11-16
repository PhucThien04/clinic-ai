import React from "react";
import { useClinic } from "../../../hooks/useClinic";
import { Tag, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { formatDateTime } from "../../../utils/dateUtils";
import "./EventsPage.css";

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
    <div className="events-container">
      <div className="events-header">
        <div className="events-badge">
          <Tag size={16} /> Tin Tức & Ưu Đãi Sự Kiện
        </div>
        <h1 className="events-title">Sự Kiện & Chương Trình Khuyến Mãi</h1>
        <p className="events-subtitle">
          Cập nhật những ưu đãi mới nhất và hoạt động tri ân khách hàng từ Nha
          Khoa Đức Tín.
        </p>
      </div>

      {loading ? (
        <div className="events-loading">Đang tải danh sách sự kiện...</div>
      ) : (
        <div className="events-list">
          {events.map((ev, index) => {
            const start = formatDateTime(ev.ThoiGianBatDau);
            const end = formatDateTime(ev.ThoiGianKetThuc);
            const timeDisplay =
              start && end ? `Từ ${start} đến ${end}` : "Đang diễn ra";

            return (
              <div key={ev.IdSuKien || index} className="event-card">
                <div className="event-info">
                  <div className="event-time-wrapper">
                    <span className="event-time-badge">
                      <Clock size={12} /> {timeDisplay}
                    </span>
                  </div>
                  <h2 className="event-card-title">{ev.TieuDe}</h2>
                  <p className="event-card-desc">{ev.NoiDung}</p>
                </div>
                <button
                  onClick={() => handleJoinEvent(ev.TieuDe)}
                  className="btn btn-primary event-btn"
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
