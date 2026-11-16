import React from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Check,
  Lock,
} from "lucide-react";
import { usePatientBooking } from "../../hooks/usePatientBooking";
import { formatDate } from "../../utils/dateUtils";
import "./PatientAppointments.css";

export default function PatientAppointments(): React.JSX.Element {
  const {
    profiles,
    appointments,
    availableDates,
    filteredSchedules,
    bookedScheduleIds,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    selectedProfile,
    setSelectedProfile,
    liDoKham,
    setLiDoKham,
    filterKeyword,
    status,
    loading,
    handleBooking,
    cancelAppointment,
    cancelStatus,
  } = usePatientBooking();

  return (
    <DashboardLayout>
      <div className="booking-container">
        <div>
          <h1 className="booking-title">Hệ Thống Đặt Lịch Khám Trực Tuyến</h1>
          <p className="booking-subtitle">
            Hệ thống tự động lọc lịch trực phù hợp với dịch vụ/sự kiện bạn đã
            chọn.
          </p>
        </div>

        {status.msg && (
          <div
            className={`status-message ${status.type === "success" ? "status-success" : "status-error"}`}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="status-text">{status.msg}</span>
          </div>
        )}

        <div className="card step-card">
          <h2 className="step-title">
            <User size={20} color="#0284c7" /> Bước 1: Chọn Hồ Sơ Khám & Thông
            Tin
          </h2>
          <div className="form-grid">
            <div>
              <label className="form-label">Hồ Sơ Bệnh Nhân *</label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="input-field form-select"
              >
                {profiles.map((p) => (
                  <option key={p.IdHoSoBenhNhan} value={p.IdHoSoBenhNhan}>
                    {p.HoTen}{" "}
                    {p.LoaiThongTin === 0
                      ? "(Bản thân)"
                      : `- Người thân (${p.MoiQuanHe || "Khác"})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">
                Lý do khám / Dịch vụ / Sự kiện
              </label>
              <input
                type="text"
                value={liDoKham}
                onChange={(e) => setLiDoKham(e.target.value)}
                placeholder="Ví dụ: Nhổ răng khôn..."
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card step-card">
          <h2 className="step-title">
            <Calendar size={20} color="#0d9488" /> Bước 2: Chọn Ngày & Khung Giờ
            Trực
          </h2>

          <div className="date-section">
            <label className="date-label">Chọn Ngày Khám:</label>
            <div className="date-buttons">
              {availableDates.length === 0 ? (
                <div className="date-empty">
                  {filterKeyword
                    ? `Chưa có lịch trực nào cho "${filterKeyword}".`
                    : "Chưa có lịch làm việc nào được mở."}
                </div>
              ) : (
                availableDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedScheduleId("");
                    }}
                    className={`date-btn ${selectedDate === date ? "date-btn-active" : "date-btn-inactive"}`}
                  >
                    {formatDate(date)}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="date-label">
              Khung Giờ Trực {filterKeyword ? "Dành Riêng" : ""}:
            </label>
            {filteredSchedules.length === 0 ? (
              <div className="schedule-empty">
                Không có ca trực phù hợp trong ngày này.
              </div>
            ) : (
              <div className="schedule-grid">
                {filteredSchedules.map((s) => {
                  const isBooked = bookedScheduleIds.has(s.IdLichLamViec);
                  const isSelected = selectedScheduleId === s.IdLichLamViec;
                  return (
                    <div
                      key={s.IdLichLamViec}
                      onClick={() => {
                        if (!isBooked) setSelectedScheduleId(s.IdLichLamViec);
                      }}
                      className={`schedule-card ${isBooked ? "schedule-booked" : isSelected ? "schedule-selected" : "schedule-default"}`}
                    >
                      {isBooked ? (
                        <div className="schedule-badge-booked">
                          <Lock size={10} /> Đã kín chỗ
                        </div>
                      ) : (
                        isSelected && (
                          <div className="schedule-badge-selected">
                            <Check size={14} />
                          </div>
                        )
                      )}
                      <div className="schedule-time">
                        <Clock
                          size={16}
                          color={isBooked ? "#94a3b8" : "#0284c7"}
                        />
                        {s.GioBatDau} - {s.GioKetThuc}
                      </div>
                      <div className="schedule-doctor">
                        <Stethoscope size={14} color="#0d9488" />{" "}
                        <strong>BS:</strong> {s.TenBacSi}
                      </div>
                      {s.GhiChu && (
                        <div className="schedule-note">{s.GhiChu}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="submit-section">
            <button
              type="button"
              disabled={loading || !selectedScheduleId}
              onClick={handleBooking}
              className="btn btn-primary submit-btn"
            >
              {loading ? "Đang xử lý..." : "Xác Nhận Đặt Lịch"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="step-title">
            <Calendar size={20} color="#0d9488" /> Lịch Hẹn Đã Đặt
          </h2>
          {appointments.length === 0 ? (
            <div className="card appt-empty">Chưa có lịch hẹn khám nào.</div>
          ) : (
            <div className="appt-grid">
              {appointments.map((apt) => {
                const showCancelStatus =
                  cancelStatus.id === apt.IdChiTietLD && cancelStatus.msg;
                const canCancel =
                  apt.TrangThai === "Đã đặt" || apt.TrangThai === "Chờ duyệt";

                return (
                  <div
                    key={apt.IdChiTietLD}
                    className="card appt-card"
                    style={{ opacity: apt.TrangThai === "Đã hủy" ? 0.6 : 1 }}
                  >
                    <div className="appt-header">
                      <span
                        className="appt-status"
                        style={{
                          background:
                            apt.TrangThai === "Đã hủy" ? "#f1f5f9" : "#e0f2fe",
                          color:
                            apt.TrangThai === "Đã hủy" ? "#64748b" : "#0284c7",
                        }}
                      >
                        {apt.TrangThai}
                      </span>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="appt-id">Mã: {apt.IdLichDat}</span>
                        {canCancel && (
                          <button
                            className="appt-cancel-btn"
                            onClick={() => cancelAppointment(apt.IdChiTietLD)}
                            disabled={loading}
                          >
                            Hủy lịch
                          </button>
                        )}
                      </div>
                    </div>

                    {showCancelStatus && (
                      <div
                        className={`cancel-message ${cancelStatus.type === "success" ? "cancel-success" : "cancel-error"}`}
                      >
                        {cancelStatus.msg}
                      </div>
                    )}

                    <div className="appt-time">
                      <Calendar size={16} color="#0284c7" /> Ngày:{" "}
                      {formatDate(apt.NgayLamViec)} ({apt.GioBatDau} -{" "}
                      {apt.GioKetThuc})
                    </div>
                    <div className="appt-doctor">
                      <strong style={{ color: "#0d9488" }}>Bác sĩ:</strong>{" "}
                      {apt.TenBacSi}
                    </div>
                    <div className="appt-reason">
                      <strong>Lý do:</strong> {apt.LiDoKham}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
